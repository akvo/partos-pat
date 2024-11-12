"use client";
import { useState } from "react";
import { Checkbox, Form, Input, message, Modal, Select } from "antd";
import { useTranslations } from "next-intl";
import { Envelope, UserCircle } from "@/components/Icons";
import { PURPOSE_OF_ACCOUNT } from "@/static/config";

import { useRouter } from "@/routing";
import SubmitButton from "../Buttons/SubmitButton";
import CountryDropdown from "../CountryDropdown";
import { PasswordInput } from "../PasswordInput";

const { useForm } = Form;

const RegisterForm = () => {
  const [openTerms, setOpenTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [form] = useForm();

  const t = useTranslations("Register");
  const tc = useTranslations("common");
  const t_err = useTranslations("Error");

  const purposeOptions = Object.keys(PURPOSE_OF_ACCOUNT).map((k) => ({
    label: tc(k),
    value: PURPOSE_OF_ACCOUNT?.[k],
  }));

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const req = await fetch(`/api/v1/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (req.ok) {
        Modal.success({
          content: t("successRegister"),
          onOk: () => {
            router.push("/login");
          },
        });
        setSubmitting(false);
      } else {
        const { message: errorMessage } = await req.json();
        message.error(errorMessage);
        setSubmitting(false);
      }
    } catch {
      message.error(t_err("500"));
      setSubmitting(false);
    }
  };

  return (
    <Form name="register" form={form} onFinish={onFinish}>
      {(_, formInstance) => {
        return (
          <>
            <Form.Item
              name="full_name"
              rules={[
                {
                  required: true,
                  message: tc("fullNameRequired"),
                },
              ]}
            >
              <Input
                placeholder={t("fullName")}
                prefix={<UserCircle />}
                variant="borderless"
              />
            </Form.Item>
            <CountryDropdown form={form} />
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
            <PasswordInput.WithRules
              errors={formInstance.getFieldError("password")}
            />
            <PasswordInput
              name="confirm_password"
              dependencies={["password"]}
              placeholder={t("confirmPassword")}
              disabled={
                formInstance.getFieldError("password").length ||
                !formInstance.isFieldTouched("password")
              }
              rules={[
                {
                  required: true,
                  message: tc("confirmPasswordRequired"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(tc("passwordMatchError")));
                  },
                }),
              ]}
              hasFeedback
            />
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error(tc("checkAgreementRequired"))),
                },
              ]}
            >
              <Checkbox>
                <span>{t("checkboxAgreement")}</span>
                <button
                  type="button"
                  className="text-blue underline font-bold ml-1"
                  onClick={() => setOpenTerms(true)}
                >
                  {t("checkboxAgreementLink")}
                </button>
              </Checkbox>
            </Form.Item>
            <Modal
              title={t("checkboxAgreementLink")}
              open={openTerms}
              onOk={() => setOpenTerms(false)}
              onCancel={() => setOpenTerms(false)}
              closable
            />
            <SubmitButton form={form} loading={submitting} block>
              {t("btnCreateAccount")}
            </SubmitButton>
          </>
        );
      }}
    </Form>
  );
};

export default RegisterForm;
