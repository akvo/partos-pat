"use client";

import { Button, Flex, Form, Input } from "antd";
import { forwardRef, useCallback, useEffect } from "react";
import { MinusCircleIcon, PlusCircleIcon } from "../Icons";
import { useTranslations } from "next-intl";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { PAT_SESSION } from "@/static/config";
import { api } from "@/lib";

const StepOne = ({ goToNext, patSession }, ref) => {
  const sessionContext = useSessionContext();
  const sessionDispatch = useSessionDispatch();

  const { data: decisions, fetched } = sessionContext.decisions;

  const onFinish = async (values) => {
    sessionDispatch({
      type: "LOADING_TRUE",
    });
    try {
      const newPayload = values?.decisions?.filter((d) => !d?.id);
      const updatePayload = values?.decisions?.filter((d) => d?.id);
      if (updatePayload.length) {
        await api("PUT", "/decisions", {
          session_id: patSession?.id,
          decisions: updatePayload,
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

  const loadDecisions = useCallback(async () => {
    if (!fetched) {
      try {
        const resData = await api(
          "GET",
          `/decisions?session_id=${patSession.id}`
        );
        ref.current.setFieldValue("decisions", resData);
        sessionDispatch({
          type: "DECISION_UPDATE",
          payload: resData,
        });
        sessionDispatch({
          type: "DECISION_FETCHED",
        });
      } catch {
        sessionDispatch({
          type: "DECISION_FETCHED",
        });
      }
    }
    if (
      fetched &&
      decisions?.length &&
      ref.current?.getFieldValue("decisions").length !== decisions.length
    ) {
      ref.current.setFieldValue("decisions", decisions);
    }
  }, [patSession, ref, decisions, fetched, sessionDispatch]);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  const t = useTranslations("Session");
  const t_error = useTranslations("Error");

  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-4 whitespace-pre-line">
        <strong>{t("step1Title")}</strong>
        <p>{t("step1Desc")}</p>
      </div>
      <Form
        ref={ref}
        initialValues={{
          decisions: [{ name: null }],
        }}
        onFinish={onFinish}
      >
        {(_, formInstance) => (
          <Form.List
            name="decisions"
            rules={[
              {
                validator: async (_, rows) => {
                  if (!rows || rows?.length < 1) {
                    return Promise.reject(new Error(t("decisionMin2")));
                  }
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
                          placeholder={`${t("decision")} ${key + 1}`}
                          variant="borderless"
                        />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "id"]}>
                        <Input type="hidden" />
                      </Form.Item>

                      <Button
                        type="link"
                        icon={<MinusCircleIcon />}
                        onClick={() => {
                          option.remove(name);
                        }}
                      />
                    </Flex>
                  ))}
                </div>

                <div className="py-1 mt-4 border-dashed border-t border-dark-2" />
                <Form.ErrorList errors={errors} />

                <div className="w-fit mb-4">
                  <Button
                    type="primary"
                    onClick={() => option.add()}
                    icon={<PlusCircleIcon />}
                    iconPosition="end"
                    size="small"
                    disabled={
                      formInstance.getFieldValue("decisions").length + 1 >
                      PAT_SESSION.maxDecisions
                    }
                    block
                    ghost
                  >
                    {t("addDecision")}
                  </Button>
                </div>
              </Flex>
            )}
          </Form.List>
        )}
      </Form>
    </div>
  );
};
export default forwardRef(StepOne);
