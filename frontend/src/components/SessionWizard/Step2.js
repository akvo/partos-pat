"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { Form, Select, Table } from "antd";
import { useTranslations } from "next-intl";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { api, decisionsToTable } from "@/lib";

const EditableCell = ({
  dataIndex,
  title,
  record,
  index,
  children,
  editable,
  score,
  ...restProps
}) => {
  const fieldName = score
    ? [record.id, dataIndex, score].join(".")
    : [record.id, dataIndex].join(".");
  return (
    <td {...restProps}>
      {editable ? (
        <Form.Item
          name={fieldName}
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
            options={Array.from({ length: 5 }).map((_, value) => ({
              value,
              label: value,
            }))}
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

const StepTwo = ({ goToNext, patSession = {} }, ref) => {
  const [preload, setPreload] = useState(true);

  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const { data: decisions } = sessionContext.decisions || { data: [] };

  const columns = useMemo(() => {
    const orgs = patSession?.organizations?.map((o) => ({
      title: o?.acronym,
      dataIndex: o?.id,
      editable: true,
    }));
    return [
      {
        dataIndex: "name",
        editable: false,
      },
      ...orgs,
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

  const allScores = useMemo(() => {
    return decisions?.flatMap((d) =>
      d?.scores?.map((s) => ({ ...s, decision_id: d?.id }))
    );
  }, [decisions]);

  const onFinish = async (values) => {
    sessionDispatch({
      type: "LOADING_TRUE",
    });
    const scores = Object.keys(values).map((k) => {
      const [decision_id, organization_id, score_id] = k?.split(".");
      if (score_id) {
        return {
          id: parseInt(score_id, 10),
          organization_id: parseInt(organization_id, 10),
          decision_id: parseInt(decision_id, 10),
          score: values?.[k],
        };
      }
      return {
        organization_id: parseInt(organization_id, 10),
        decision_id: parseInt(decision_id, 10),
        score: values?.[k],
      };
    });

    const updateScores = scores.filter((s) => s?.id);

    try {
      let resData = [];
      if (updateScores.length) {
        resData = await api("PUT", "/participant-decisions", {
          session_id: patSession?.id,
          scores: updateScores,
        });
      } else {
        resData = await api("POST", "/participant-decisions", {
          session_id: patSession?.id,
          scores,
        });
      }
      const decisionPayload = decisions.map((d) => ({
        ...d,
        scores: resData.filter((r) => r?.decision_id === d?.id),
      }));

      sessionDispatch({
        type: "DECISION_UPDATE",
        payload: decisionPayload,
      });

      sessionDispatch({
        type: "LOADING_FALSE",
      });
      goToNext();
    } catch (err) {
      console.error(err);
      sessionDispatch({
        type: "LOADING_FALSE",
      });
    }
  };

  useEffect(() => {
    if (preload && ref?.current) {
      setPreload(false);
      allScores.forEach((s) => {
        ref.current.setFieldValue(
          `${s.decision_id}.${s.organization_id}.${s.id}`,
          s.score
        );
      });
    }
  }, [preload, allScores, ref]);

  const t = useTranslations("Session");
  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-4 whitespace-pre-line">
        <strong>{t("step2Title")}</strong>
        <p>{t("step2Desc")}</p>
        <ul className="list-disc ml-4">
          <li>{t("score4")}</li>
          <li>{t("score3")}</li>
          <li>{t("score2")}</li>
          <li>{t("score1")}</li>
          <li>{t("score0")}</li>
        </ul>
      </div>
      <Form ref={ref} component={false} onFinish={onFinish}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={dataSource}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>
    </div>
  );
};
export default forwardRef(StepTwo);
