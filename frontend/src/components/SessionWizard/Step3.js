"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { Form, Select, Table } from "antd";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { api, decisionsToTable } from "@/lib";
import ScoreLegend from "./ScoreLegend";

const EditableCell = (
  {
    dataIndex,
    title,
    record,
    children,
    editable,
    score,
    className,
    haveEditAccess,
    ...restProps
  },
  formInstance,
) => {
  const t = useTranslations("Session");
  const t_error = useTranslations("Error");

  if (typeof dataIndex === "number") {
    return (
      <td
        className={classNames("font-bold", {
          "bg-score-4": Object.values(children).includes(4),
          "bg-score-3": Object.values(children).includes(3),
          "bg-score-2": Object.values(children).includes(2),
          "bg-score-1": Object.values(children).includes(1),
          "bg-light-1": Object.values(children).includes(0),
        })}
        {...restProps}
      >
        {children}
      </td>
    );
  }

  const agreeValue = record?.id ? formInstance.getFieldValue(record.id) : null;
  return (
    <td
      className={classNames(className, {
        "td-yes": agreeValue === 1,
        "td-no": agreeValue === 0,
      })}
      {...restProps}
    >
      {editable && haveEditAccess ? (
        <Form.Item
          name={record.id}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: t_error("required", {
                field_title: title,
              }),
            },
          ]}
        >
          <Select
            options={[
              { value: 1, label: t("yes") },
              { value: 0, label: t("no") },
            ]}
            variant="borderless"
            className="pat-score"
          />
        </Form.Item>
      ) : (
        <>
          {dataIndex === "agree" ? (agreeValue ? t("yes") : t("no")) : children}
        </>
      )}
    </td>
  );
};

const StepThree = ({ patSession = {}, isEditable = false }, ref) => {
  const [preload, setPreload] = useState(true);

  const t = useTranslations("Session");
  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const { data: decisions } = sessionContext.decisions || { data: [] };
  const { saving } = sessionContext;

  const columns = useMemo(() => {
    const orgs = patSession?.organizations?.map((o) => ({
      title: o?.acronym,
      dataIndex: o?.id,
      editable: false,
      key: o?.id,
      className: "pat-org",
    }));
    return [
      {
        dataIndex: "name",
        editable: false,
        key: "name",
        // width: 432,
        fixed: "left",
      },
      ...orgs,
      {
        title: t("agree"),
        dataIndex: "agree",
        editable: true,
        key: "agree",
        width: "100px",
        fixed: "right",
      },
    ].map((col) => ({
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editable: col.editable,
        score: col.editable ? record?.[`id_${col.dataIndex}`] : null,
      }),
    }));
  }, [patSession, t]);

  const dataSource = useMemo(() => {
    return decisionsToTable(decisions, patSession?.organizations);
  }, [decisions, patSession]);

  const onFinish = async (values) => {
    try {
      const updatePayload = Object.keys(values).map((k) => ({
        id: k,
        agree: values[k] === 1,
      }));

      await api("PUT", "/decisions", {
        session_id: patSession?.id,
        decisions: updatePayload,
      });

      sessionDispatch({
        type: "DECISION_UPDATE",
        payload: decisions.map((d) => ({
          ...d,
          agree: values?.[d?.id],
        })),
      });

      if (!saving) {
        sessionDispatch({
          type: "STEP_NEXT",
        });
      }
      sessionDispatch({
        type: "STOP_LOADING",
      });
    } catch (err) {
      console.error(err);
      sessionDispatch({
        type: "STOP_LOADING",
      });
    }
  };

  useEffect(() => {
    if (preload && ref && decisions.length) {
      setPreload(false);
      decisions.forEach((d) => {
        const value = d?.agree ? 1 : d?.agree === null ? null : 0;
        ref.current.setFieldValue(`${d.id}`, value);
      });
    }
  }, [preload, ref, decisions]);

  return (
    <div className="w-full space-y-6">
      <p className="w-full whitespace-pre-line">{t("step3Desc")}</p>
      <Form
        ref={ref}
        component={false}
        initialValues={{
          11: 1,
        }}
        onFinish={onFinish}
      >
        <Table
          components={{
            body: {
              cell: (props) =>
                EditableCell(
                  { haveEditAccess: isEditable, ...props },
                  ref.current,
                ),
            },
          }}
          rowKey="id"
          dataSource={dataSource}
          columns={columns}
          className="pat-table"
          pagination={false}
          scroll={{
            x: "max-content",
          }}
        />
      </Form>
      <div className="pt-4">
        <div className="py-2 border-dashed border-t border-dark-2" />
      </div>
      <ScoreLegend />
    </div>
  );
};

export default forwardRef(StepThree);
