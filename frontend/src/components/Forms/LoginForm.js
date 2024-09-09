"use client";

import { useState } from "react";
import { Form, Input, message } from "antd";
import { useTranslations } from "next-intl";
import { Envelope } from "@/components/Icons";
import { useRouter } from "@/routing";
import SubmitButton from "../SubmitButton";
import { api } from "@/lib";
import { PasswordInput } from "../PasswordInput";

const { useForm } = Form;

const LoginForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [form] = useForm();

  const t = useTranslations("Login");
  const tc = useTranslations("common");
  const te = useTranslations("Error");

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await api.post("/users/login", values);
      router.push("/dashboard");
      setSubmitting(false);
    } catch ({ data: errData, status }) {
      const { message: errorMessage } = errData;
      message.error(status === 500 ? te("500") : errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <Form name="login" form={form} onFinish={onFinish}>
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
      <PasswordInput
        name="password"
        rules={[
          {
            required: true,
            message: tc("passwordRequired"),
          },
        ]}
        placeholder={tc("password")}
        className="min-h-10"
      />
      <SubmitButton form={form} loading={submitting} block>
        {t("loginText")}
      </SubmitButton>
    </Form>
  );
};

export default LoginForm;
