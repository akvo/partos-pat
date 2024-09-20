"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Form, Input, Modal } from "antd";
import VerticalLogo from "../VerticalLogo";
import { PARTOS } from "@/static/config";

const { useForm } = Form;

const JoinModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const handleOnFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    console.log("values", values);
  };

  const t = useTranslations("Dashboard");
  const tc = useTranslations("common");
  const t_error = useTranslations("Error");
  return (
    <>
      <Button onClick={() => setOpen(true)} ghost>
        {t("joinSession")}
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        okButtonProps={{
          style: {
            display: "none",
          },
        }}
        cancelButtonProps={{
          style: {
            display: "none",
          },
        }}
        maskClosable={false}
        width={556}
        closable
      >
        <div className="w-full flex flex-col justify-center items-center py-16 px-4 md:px-9 space-y-8">
          <div className="pb-8">
            <VerticalLogo />
          </div>
          <Form form={form} onFinish={handleOnFinish} className="w-full space-y-4">
            <Form.Item
              name="join_code"
              rules={[
                {
                  required: true,
                  message: t_error("required", {
                    field_title: t("enterCode"),
                  }),
                },
              ]}
            >
              <Input
                variant="borderless"
                placeholder={t("enterCodePlaceholder")}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t("enterCode")}
            </Button>
          </Form>

          <p className="text-base text-dark-10">
            {tc.rich("contactText", {
              email: () => (
                <a
                  href={`mailto:${PARTOS.email}`}
                  className="text-blue underline"
                >
                  {PARTOS.email}
                </a>
              ),
            })}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default JoinModal;
