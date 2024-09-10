"use client";

import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { useTranslations } from "next-intl";
import { Envelope, LockIcon } from "@/components/Icons";
import { Link, useRouter } from "@/routing";
import SubmitButton from "../Buttons/SubmitButton";
import { PasswordInput } from "../PasswordInput";
import { signIn } from "@/lib/auth";

const { useForm } = Form;

const LoginForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [form] = useForm();

  const t = useTranslations("Login");
  const tc = useTranslations("common");
  const tr = useTranslations("Error");

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const { status, message: errorKey } = await signIn(values);
      if (status === 200) {
        router.push("/dashboard");
      } else {
        setSubmitting(false);
        message.error(tr(errorKey));
      }
    } catch (error) {
      const errorKey = error.message.replace(/^Error:\s*/, "");
      message.error(tr(errorKey));
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
      <div className="w-full text-right mb-6">
        <Link href="/forgot-password">
          <Button type="link" icon={<LockIcon />}>
            {t("forgotLink")}
          </Button>
        </Link>
      </div>
      <SubmitButton form={form} loading={submitting} block>
        {t("loginText")}
      </SubmitButton>
    </Form>
  );
};

export default LoginForm;
