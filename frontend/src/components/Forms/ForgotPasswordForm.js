"use client";

import { useState } from "react";
import { Form, Input, message } from "antd";
import { useTranslations } from "next-intl";
import { Envelope } from "@/components/Icons";
import SubmitButton from "../Buttons/SubmitButton";

const { useForm } = Form;

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form] = useForm();

  const t = useTranslations("ForgotPassword");
  const tc = useTranslations("common");
  const tr = useTranslations("Error");

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setSuccess(true);
        setLoading(false);
      } else {
        setLoading(false);
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      const errorKey = error.message.replace(/^Error:\s*/, "");
      message.error(tr(errorKey));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mt-4">{t("emailSent")}</h2>
        <p className="text-gray-500 mt-2">{t("emailSentDescription")}</p>
      </div>
    );
  }

  return (
    <Form name="forgot-password" form={form} onFinish={onFinish}>
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            type: "email",
            message: tc("emailRequired"),
          },
        ]}
      >
        <Input
          placeholder={tc("email")}
          type="email"
          prefix={<Envelope />}
          variant="borderless"
        />
      </Form.Item>
      <SubmitButton form={form} loading={loading} block>
        {t("sendLink")}
      </SubmitButton>
    </Form>
  );
};

export default ForgotPasswordForm;
