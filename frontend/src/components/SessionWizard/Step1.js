"use client";

import { Button, Flex, Form, Input } from "antd";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { MinusCircleIcon, PlusCircleIcon } from "../Icons";
import { useTranslations } from "next-intl";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { PAT_SESSION } from "@/static/config";
import { api } from "@/lib";

const StepOne = ({ patSession, isEditable = false }, ref) => {
  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();
  const [preload, setPreload] = useState(true);

  const { data: decisions, fetched } = sessionContext.decisions;
  const { saving } = sessionContext;

  const onFinish = async (values) => {
    try {
      const newPayload = values?.decisions?.filter((d) => !d?.id);
      const updatePayload = values?.decisions?.filter((d) => d?.id);
      if (updatePayload.length) {
        await api("PUT", "/decisions", {
          session_id: patSession?.id,
          decisions: updatePayload.map(({ id, name, agree }) => ({
            id,
            name,
            agree,
          })),
        });
        sessionDispatch({
          type: "DECISION_UPDATE",
          payload: updatePayload,
        });
      }
      if (newPayload.length) {
        const newItems = await api("POST", "/decisions", {
          session_id: patSession?.id,
          decisions: newPayload,
        });
        sessionDispatch({
          type: "DECISION_UPDATE",
          payload: [...decisions, ...newItems],
        });
      }
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

  const onDeleteDecision = async (option, { key, value }) => {
    try {
      option.remove(key);
      if (value) {
        await api("DELETE", `/decision/${value}`);
        sessionDispatch({
          type: "DECISION_UPDATE",
          payload: decisions.filter((d) => d?.id !== value),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDecisions = useCallback(async () => {
    if (fetched && preload) {
      setPreload(false);
      if (decisions.length) {
        ref.current.setFieldValue("decisions", decisions);
      } else {
        ref.current.setFieldValue("decisions", [{ name: null }]);
      }
    }
  }, [ref, decisions, fetched, preload]);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  const t = useTranslations("Session");
  const t_error = useTranslations("Error");

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-2 whitespace-pre-line">
        <strong>{t("step1Title")}</strong>
        <p>{t("step1Desc")}</p>
      </div>
      <Form ref={ref} onFinish={onFinish}>
        {(_, formInstance) => (
          <Form.List
            name="decisions"
            rules={[
              {
                validator: async (_, rows) => {
                  if ((!rows || rows?.length < 1) && isEditable) {
                    return Promise.reject(new Error(t("decisionMin2")));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, option, { errors }) => (
              <Flex gap={16} vertical>
                <div className="w-full relative">
                  {fields.map(({ key, name, ...restField }) => (
                    <Flex className="w-full" key={key} gap="middle">
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        className="w-full"
                        rules={[
                          {
                            required: true,
                            message: t_error("required", {
                              field_title: `${t("decision")} ${key + 1}`,
                            }),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t("step1Placeholder")}
                          variant="borderless"
                          disabled={!isEditable}
                          className="pat-decision"
                        />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "id"]}>
                        <Input type="hidden" />
                      </Form.Item>

                      {isEditable && (
                        <Button
                          type="link"
                          icon={<MinusCircleIcon />}
                          onClick={() => {
                            onDeleteDecision(option, {
                              key: name,
                              value: formInstance.getFieldValue([
                                "decisions",
                                name,
                                "id",
                              ]),
                            });
                          }}
                        />
                      )}
                    </Flex>
                  ))}
                </div>

                <div className="py-1 mt-4 border-dashed border-t border-dark-2" />
                <Form.ErrorList errors={errors} />
                {isEditable && (
                  <div className="w-fit mb-4">
                    <Button
                      type="primary"
                      onClick={() => option.add()}
                      icon={<PlusCircleIcon />}
                      iconPosition="end"
                      size="small"
                      disabled={
                        formInstance.getFieldValue("decisions")?.length >
                        PAT_SESSION.maxDecisions
                      }
                      block
                      ghost
                    >
                      {t("addDecision")}
                    </Button>
                  </div>
                )}
              </Flex>
            )}
          </Form.List>
        )}
      </Form>
    </div>
  );
};
export default forwardRef(StepOne);
