"use client";

import { forwardRef, useMemo } from "react";
import { Form, Input } from "antd";
import { useTranslations } from "next-intl";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { api, decisionsToTable } from "@/lib";
import ScoreLegend from "./ScoreLegend";
import classNames from "classnames";

const { TextArea } = Input;

const StepFive = ({ patSession = {} }, ref) => {
  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const { data: decisions } = sessionContext.decisions || { data: [] };
  const { saving } = sessionContext;

  const inputDecisions = useMemo(() => {
    const orgs = patSession?.organizations;
    const items = decisions.filter((d) => !d?.agree);

    return decisionsToTable(items, orgs);
  }, [decisions, patSession]);

  const onFinish = async (values) => {
    try {
      const payload = {
        session_id: patSession?.id,
        decisions: values?.decisions?.map((d) => {
          return {
            id: d?.id,
            notes: d?.notes,
          };
        }),
      };
      await api("PUT", "/decisions", payload);

      sessionDispatch({
        type: "DECISION_UPDATE",
        payload: decisions.map((d) => {
          const fd = values?.decisions?.find((vd) => vd?.id === d?.id);
          return fd ? { ...d, ...fd } : d;
        }),
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
        <strong>{t("step5Title")}</strong>
        <p>{t("step5Desc")}</p>
      </div>
      <Form
        ref={ref}
        component={false}
        initialValues={{
          decisions: inputDecisions,
        }}
        onFinish={onFinish}
      >
        {(_, formInstance) => (
          <Form.List name="decisions">
            {(fields) => (
              <div className="w-full text-sm space-y-8">
                {fields.map(({ key, name, ...restField }) => {
                  return (
                    <div key={key} className="w-full space-y-6">
                      <div className="w-full flex items-end justify-between border-b border-b-grey-100">
                        <div className="w-full lg:w-1/2 p-1">
                          {formInstance.getFieldValue([
                            "decisions",
                            name,
                            "name",
                          ])}
                        </div>
                        <div className="w-fit flex flex-col">
                          <div className="flex items-center justify-end font-bold bg-light-grey-7">
                            {patSession?.organizations?.map((org) => {
                              return (
                                <div
                                  key={org.id}
                                  className="w-20 px-2 py-1 border-x border-x-light-1"
                                >
                                  {org.acronym}
                                </div>
                              );
                            })}
                            <div className="w-20 px-2 py-1 border-x border-x-light-1">
                              {t("agree")}
                            </div>
                          </div>
                          <div className="flex items-center justify-end font-bold">
                            {patSession?.organizations?.map((org) => {
                              const actualValue = formInstance.getFieldValue([
                                "decisions",
                                name,
                                org.id,
                              ]);
                              return (
                                <div
                                  key={org.id}
                                  className={classNames(
                                    "w-20 px-2 py-1 border-x border-x-light-1",
                                    {
                                      "bg-score-4": actualValue === 4,
                                      "bg-score-3": actualValue === 3,
                                      "bg-score-2": actualValue === 2,
                                      "bg-score-1": actualValue === 1,
                                      "bg-light-1": actualValue === 0,
                                    }
                                  )}
                                >
                                  {actualValue}
                                </div>
                              );
                            })}
                            <div className="w-20 px-2 py-1 border-x border-x-light-1 td-no">
                              {t("no")}
                            </div>
                          </div>
                          <div className="flex items-center justify-end">
                            {patSession?.organizations?.map((org) => {
                              const desiredValue = formInstance.getFieldValue([
                                "decisions",
                                name,
                                `desired.${org.id}`,
                              ]);
                              return (
                                <div
                                  key={org.id}
                                  className={classNames(
                                    "w-20 px-2 py-1 border-x border-x-light-1",
                                    {
                                      "bg-score-4": desiredValue === 4,
                                      "bg-score-3": desiredValue === 3,
                                      "bg-score-2": desiredValue === 2,
                                      "bg-score-1": desiredValue === 1,
                                      "bg-light-1": desiredValue === 0,
                                    }
                                  )}
                                >
                                  {desiredValue}
                                </div>
                              );
                            })}
                            <div className="w-20 px-2 py-1 border-x border-x-light-1 td-yes">
                              {t("yes")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Form.Item
                        {...restField}
                        name={[name, "notes"]}
                        rules={[
                          {
                            required: true,
                            message: t_error("required", {
                              field_title: t("notes"),
                            }),
                          },
                        ]}
                      >
                        <TextArea rows={3} placeholder={t("notes")} />
                      </Form.Item>
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
        )}
      </Form>
      <div className="pt-4">
        <div className="py-2 border-dashed border-t border-dark-2" />
      </div>
      <ScoreLegend />
    </div>
  );
};
export default forwardRef(StepFive);
