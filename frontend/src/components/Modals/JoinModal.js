"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Form, Input, Modal, Select } from "antd";
import VerticalLogo from "../VerticalLogo";
import { PARTOS } from "@/static/config";
import { api, errorsMapping } from "@/lib";
import { useRouter } from "@/routing";

const { useForm } = Form;

const JoinModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const router = useRouter();

  const [form] = useForm();

  const handleOnFinish = async ({ join_code, ...values }) => {
    setLoading(true);
    try {
      if (join_code) {
        const { details, ..._session } = await api(
          "GET",
          `/sessions?code=${join_code}`
        );
        if (details) {
          const _errors = errorsMapping(details, (errKey) => t(errKey));
          if (_errors.length) {
            form.setFields(_errors);
          }
          setLoading(false);
        }
        if (_session?.id) {
          setSession(_session);
          setLoading(false);
          form.resetFields();
        }
      }

      if (session?.id) {
        const { message, details } = await api("POST", "/participants/join/", {
          ...values,
          session_id: session.id,
        });
        if (message === "Ok") {
          router.push(`/dashboard/sessions/${session.id}`);
          setLoading(false);
        }

        if (details) {
          const _errors = errorsMapping(details, (errKey) => t(errKey));
          if (_errors.length) {
            form.setFields(_errors);
          }
          setLoading(false);
        }
      }
    } catch {
      setLoading(false);
    }
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
        onCancel={() => {
          setSession(null);
          setOpen(false);
        }}
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
          <Form
            form={form}
            onFinish={handleOnFinish}
            className="w-full space-y-4"
          >
            {!session && (
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
            )}
            {session?.organizations?.length > 0 && (
              <Form.Item
                name="organization_id"
                rules={[
                  {
                    required: true,
                    message: t_error("required", {
                      field_title: t("selectOrg"),
                    }),
                  },
                ]}
              >
                <Select
                  placeholder={t("selectOrg")}
                  options={session.organizations}
                  fieldNames={{ label: "name", value: "id" }}
                  optionFilterProp="name"
                  variant="borderless"
                  showSearch
                  allowClear
                />
              </Form.Item>
            )}
            {session?.id && (
              <Form.Item
                name="role"
                rules={[
                  {
                    required: true,
                    message: t_error("required", {
                      field_title: t("selectRole"),
                    }),
                  },
                ]}
              >
                <Input variant="borderless" placeholder={t("selectRole")} />
              </Form.Item>
            )}
            {session?.id && (
              <Form.Item name="session_id">
                <Input
                  variant="borderless"
                  type="hidden"
                  placeholder={t("selectRole")}
                />
              </Form.Item>
            )}
            <Button type="primary" htmlType="submit" loading={loading} block>
              {session?.id ? t("joinSession") : t("enterCode")}
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
