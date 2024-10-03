"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { Form, Select, Table } from "antd";
import { useTranslations } from "next-intl";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { api, decisionsToTable } from "@/lib";
import classNames from "classnames";

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
  const fieldName = score
    ? [record?.id, dataIndex, score].join(".")
    : [record?.id, dataIndex].join(".");
  const actualValue = record?.[dataIndex] || null;
  const t_error = useTranslations("Error");
  return (
    <td
      className={classNames({
        [className]: typeof dataIndex !== "number",
        "bg-score-4": actualValue === 4,
        "bg-score-3": actualValue === 3,
        "bg-score-2": actualValue === 2,
        "bg-score-1": actualValue === 1,
        "bg-light-1": actualValue === 0,
      })}
      {...restProps}
    >
      {editable ? (
        <Form.Item
          name={fieldName}
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
            options={Array.from({ length: 5 }).map((_, value) => ({
              value,
              label: value,
            }))}
            variant="borderless"
            className="pat-score"
          />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const StepTwo = ({ patSession = {} }, ref) => {
  const [preload, setPreload] = useState(true);

  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const { data: decisions } = sessionContext.decisions || { data: [] };
  const { saving } = sessionContext;

  const columns = useMemo(() => {
    const orgs = patSession?.organizations?.map((o) => ({
      title: o?.acronym,
      dataIndex: o?.id,
      editable: true,
      key: o?.id,
      width: "100px",
    }));
    return [
      {
        dataIndex: "name",
        editable: false,
        key: "name",
        fixed: "left",
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
      d?.scores?.length
        ? d.scores.map((s) => ({ ...s, decision_id: d?.id }))
        : patSession?.organizations?.map((o) => ({
            decision_id: d?.id,
            organization_id: o?.id,
          }))
    );
  }, [decisions, patSession]);

  const onFinish = async (values) => {
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
    const newScores = scores.filter((s) => !s?.id);

    try {
      let decisionScores = decisions?.flatMap((d) =>
        d?.scores?.map((s) => ({ ...s, decision_id: d?.id }))
      );

      if (updateScores.length) {
        await api("PUT", "/participant-decisions", {
          session_id: patSession?.id,
          scores: updateScores,
        });
        decisionScores = decisionScores.map((s) => {
          const fs = updateScores.find((u) => u?.id === s?.id);
          return fs ? { ...s, ...fs } : s;
        });
      }

      if (newScores.length) {
        const newItems = await api("POST", "/participant-decisions", {
          session_id: patSession?.id,
          scores: newScores,
        });
        decisionScores = [...decisionScores, ...newItems];
      }
      const decisionPayload = decisions.map((d) => ({
        ...d,
        scores: decisionScores.filter((s) => s?.decision_id === d?.id),
      }));

      sessionDispatch({
        type: "DECISION_UPDATE",
        payload: decisionPayload,
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
      <div className="w-full space-y-2 whitespace-pre-line">
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
          rowKey="id"
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
