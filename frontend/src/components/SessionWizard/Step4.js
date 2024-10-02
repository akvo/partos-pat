"use client";

import { forwardRef, useMemo } from "react";
import { Form, Select } from "antd";
import { useTranslations } from "next-intl";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { api, decisionsToTable } from "@/lib";
import ScoreLegend from "./ScoreLegend";

const StepFour = ({ patSession = {} }, ref) => {
  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const { data: decisions } = sessionContext.decisions || { data: [] };

  const scores = useMemo(() => {
    const orgs = patSession?.organizations;
    const items = decisions.filter((d) => !d?.agree);

    return decisionsToTable(items, orgs);
  }, [decisions, patSession]);

  const onFinish = async (values) => {
    try {
      const scores = values.scores.flatMap((v) => {
        return Object.keys(v)
          .filter((k) => k?.includes("desired."))
          .map((k) => {
            const [_, organization_id] = k.split(".");
            const score_id = v[`desired_id_${organization_id}`];
            const r = {
              organization_id: parseInt(organization_id, 10),
              decision_id: v["id"],
              score: v[k],
              desired: true,
            };
            if (score_id) {
              return { id: score_id, ...r };
            }
            return r;
          });
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
    } catch (err) {
      console.error(err);
      sessionDispatch({
        type: "STOP_LOADING",
      });
    }
  };

  const t = useTranslations("Session");

  return (
    <div className="w-full space-y-4">
      <p>{t("step4Desc")}</p>
      <Form
        ref={ref}
        component={false}
        initialValues={{
          scores,
        }}
        onFinish={onFinish}
      >
        {(_, formInstance) => (
          <Form.List name="scores">
            {(fields) => (
              <div className="w-full">
                {fields.map(({ key, name, ...restField }) => {
                  return (
                    <div key={key} className="w-full flex">
                      <div className="w-full lg:w-1/2">
                        {formInstance.getFieldValue(["scores", name, "name"])}
                      </div>
                      {patSession?.organizations?.map((org) => {
                        return (
                          <div key={org.id} className="flex flex-col">
                            <div>{org.acronym}</div>
                            <div>
                              {formInstance.getFieldValue([
                                "scores",
                                name,
                                org.id,
                              ])}
                            </div>
                            <div>
                              <Form.Item
                                {...restField}
                                name={[name, `desired.${org.id}`]}
                                style={{
                                  margin: 0,
                                }}
                                rules={[
                                  {
                                    required: true,
                                  },
                                ]}
                              >
                                <Select
                                  options={Array.from({ length: 5 }).map(
                                    (_, value) => ({
                                      value,
                                      label: value,
                                    })
                                  )}
                                  variant="borderless"
                                  className="pat-score"
                                />
                              </Form.Item>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex flex-col">
                        <div>{t("agree")}</div>
                        <div>{t("no")}</div>
                        <div>{t("yes")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
        )}
      </Form>
      <ScoreLegend />
    </div>
  );
};
export default forwardRef(StepFour);
