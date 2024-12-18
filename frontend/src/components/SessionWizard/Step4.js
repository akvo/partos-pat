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
import classNames from "classnames";

const StepFour = ({ patSession = {}, isEditable = false }, ref) => {
  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const { data: decisions } = sessionContext.decisions || { data: [] };
  const { saving } = sessionContext;

  const scores = useMemo(() => {
    const orgs = patSession?.organizations;
    const items = decisions.filter((d) => !d?.agree);

    return decisionsToTable(items, orgs);
  }, [decisions, patSession]);

  const onFinish = async (values) => {
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
        d?.scores?.map((s) => ({ ...s, decision_id: d?.id })),
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

  const t = useTranslations("Session");
  const t_error = useTranslations("Error");

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-2 whitespace-pre-line">
        <strong>{t("step4Title")}</strong>
        <p>
          {t.rich("step4Desc", {
            italic: (token) => (
              <>
                <i>{token}</i>
                <br />
              </>
            ),
          })}
        </p>
        <ul className="list-disc ml-8 text-sm xl:text-base">
          <li>{t("step4Text1")}</li>
          <li>{t("step4Text2")}</li>
        </ul>
        <p>{t("step4TextEnd")}</p>
      </div>
      <Form
        ref={ref}
        component={false}
        initialValues={{
          scores,
        }}
        onFinish={onFinish}
      >
        {(_, formInstance) => (
          <div className="w-full overflow-hidden">
            <Form.List name="scores">
              {(fields) => (
                <div className="w-full bg-light-1 text-sm space-y-8 overflow-x-auto pb-8 relative">
                  {fields.map(({ key, name, ...restField }) => {
                    return (
                      <div key={key}>
                        <div className="w-full h-auto flex items-start justify-between border-y border-y-grey-100">
                          <div className="w-full min-h-9 lg:min-w-[248px] xl:min-w-[348px] 2xl:min-w-[432px] p-1 sticky left-0 z-20 bg-light-1 font-bold">
                            {formInstance.getFieldValue([
                              "scores",
                              name,
                              "name",
                            ])}
                          </div>
                          <div className="w-fit z-0 flex items-center justify-end font-bold bg-light-grey-7">
                            {patSession?.organizations?.map((org) => {
                              return (
                                <div
                                  key={org.id}
                                  className="w-24 p-2 border-x border-x-light-1 truncate break-words text-ellipsis"
                                >
                                  {org.acronym}
                                </div>
                              );
                            })}
                          </div>
                          <div className="w-24 sticky right-0 z-20 bg-light-1">
                            <div className="w-24 p-2 border-x border-x-light-1 font-bold bg-light-grey-7">
                              {t("agree")}
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-full flex items-start justify-between border-b border-b-grey-100">
                          <div className="w-full h-40 lg:min-w-[248px] xl:min-w-[348px] 2xl:min-w-[432px] sticky left-0 z-20 bg-light-1">
                            <div className="h-10 py-1 text-sm border-b border-b-grey-100">
                              {t("step4ActiveLabel")}
                            </div>
                            <div className="h-10 py-1 text-sm border-b border-b-grey-100">
                              {t("step4DesiredLabel")}
                            </div>
                          </div>

                          <div className="w-fit flex flex-col z-0">
                            <div className="flex items-center justify-end font-bold">
                              {patSession?.organizations?.map((org) => {
                                const actualValue = formInstance.getFieldValue([
                                  "scores",
                                  name,
                                  org.id,
                                ]);
                                return (
                                  <div
                                    key={org.id}
                                    className={classNames(
                                      "w-24 h-10 border-x border-x-light-1 border-b border-b-grey-100",
                                      {
                                        "p-2": !isEditable,
                                        "px-4 py-2": isEditable,
                                        "bg-score-4": actualValue === 4,
                                        "bg-score-3": actualValue === 3,
                                        "bg-score-2": actualValue === 2,
                                        "bg-score-1": actualValue === 1,
                                        "bg-light-1": actualValue === 0,
                                      },
                                    )}
                                  >
                                    {actualValue}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-end">
                              {patSession?.organizations?.map((org) => {
                                const desiredValue = formInstance.getFieldValue(
                                  ["scores", name, `desired.${org.id}`],
                                );
                                return (
                                  <div
                                    key={org.id}
                                    className={classNames(
                                      "w-24 h-10 p-2 border-x border-x-light-1 border-b border-b-grey-100",
                                      {
                                        "bg-score-4": desiredValue === 4,
                                        "bg-score-3": desiredValue === 3,
                                        "bg-score-2": desiredValue === 2,
                                        "bg-score-1": desiredValue === 1,
                                        "bg-light-1": desiredValue === 0,
                                      },
                                    )}
                                  >
                                    {isEditable ? (
                                      <Form.Item
                                        {...restField}
                                        name={[name, `desired.${org.id}`]}
                                        style={{
                                          margin: 0,
                                        }}
                                        rules={[
                                          {
                                            required: true,
                                            message: t_error("required", {
                                              field_title: t("score"),
                                            }),
                                          },
                                        ]}
                                      >
                                        <Select
                                          options={Array.from({
                                            length: 5,
                                          }).map((_, value) => ({
                                            value,
                                            label: value,
                                          }))}
                                          variant="borderless"
                                          className="w-full pat-score"
                                        />
                                      </Form.Item>
                                    ) : (
                                      <>
                                        {formInstance.getFieldValue([
                                          "scores",
                                          name,
                                          `desired.${org.id}`,
                                        ])}
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="w-24 h-40 sticky right-0 z-20 bg-light-1">
                            <div className="w-24 h-10 p-2 border-x border-x-light-1 td-no border-b border-b-grey-100">
                              {t("no")}
                            </div>
                            <div className="w-24 h-10 p-2 border-x border-x-light-1 td-yes border-b border-b-grey-100">
                              {t("yes")}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.List>
          </div>
        )}
      </Form>
      <div className="pt-4">
        <div className="py-2 border-dashed border-t border-dark-2" />
      </div>
      <ScoreLegend />
    </div>
  );
};
export default forwardRef(StepFour);
