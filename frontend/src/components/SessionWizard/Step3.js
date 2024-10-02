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

const EditableCell = ({
  dataIndex,
  title,
  record,
  children,
  editable,
  score,
  className,
  ...restProps
}) => {
  const t = useTranslations("Session");

  if (typeof dataIndex === "number") {
    return (
      <td
        className={classNames({
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
  return (
    <td className={className} {...restProps}>
      {editable ? (
        <Form.Item
          name={record.id}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          <Select
            options={[
              { value: 1, label: t("yes") },
              { value: 0, label: t("no") },
            ]}
            variant="borderless"
            className="w-full"
          />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const StepThree = ({ patSession = {} }, ref) => {
  const [preload, setPreload] = useState(true);

  const t = useTranslations("Session");
  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const { data: decisions } = sessionContext.decisions || { data: [] };

  const columns = useMemo(() => {
    const orgs = patSession?.organizations?.map((o) => ({
      title: o?.acronym,
      dataIndex: o?.id,
      editable: false,
      key: o?.id,
    }));
    return [
      {
        dataIndex: "name",
        editable: false,
        key: "name",
      },
      ...orgs,
      {
        title: t("agree"),
        dataIndex: "agree",
        editable: true,
        key: "agree",
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
  }, [patSession]);

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

      sessionDispatch({
        type: "STOP_LOADING",
      });
      sessionDispatch({
        type: "STEP_NEXT",
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
    <div className="w-full space-y-4">
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
              cell: EditableCell,
            },
          }}
          bordered
          rowKey="id"
          dataSource={dataSource}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>
      <ScoreLegend />
    </div>
  );
};

export default forwardRef(StepThree);
