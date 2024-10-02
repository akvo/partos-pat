"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Form, Input } from "antd";
import { useSessionDispatch } from "@/context/SessionContextProvider";
import { api } from "@/lib";

const { TextArea } = Input;

const StepSix = ({ patSession }, ref) => {
  const t = useTranslations("Session");
  const sessionDispatch = useSessionDispatch();

  const onFinish = async (values) => {
    try {
      if (patSession?.is_owner) {
        await api("PUT", `/sessions?id=${patSession.id}`, {
          notes: values?.notes || "",
          summary: values?.summary || "",
        });
        sessionDispatch({
          type: "STOP_LOADING",
        });
      }

      if (values?.comment) {
        await api("POST", `/session/${patSession.id}/comments`, {
          comment: values.comment,
        });
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

  return (
    <div className="w-full space-y-6">
      {patSession?.is_owner && <strong>{t("step6Title")}</strong>}
      <Form
        layout="vertical"
        initialValues={{
          notes: patSession?.notes,
          summary: patSession?.summary,
        }}
        onFinish={onFinish}
        ref={ref}
      >
        {!patSession?.is_owner && (
          <Form.Item
            name="comment"
            label={<div className="py-4">{t("step6Comment")}</div>}
          >
            <TextArea placeholder={t("step6CommentPlaceholder")} rows={6} />
          </Form.Item>
        )}
        {patSession?.is_owner && (
          <Form.Item name="notes" label={t("step6Notes")}>
            <TextArea placeholder={t("step6NotesPlaceholder")} rows={6} />
          </Form.Item>
        )}
        {patSession?.is_owner && (
          <Form.Item name="summary" label={t("step6Summary")}>
            <TextArea placeholder={t("step6SummaryPlaceholder")} rows={6} />
          </Form.Item>
        )}
      </Form>
    </div>
  );
};
export default forwardRef(StepSix);
