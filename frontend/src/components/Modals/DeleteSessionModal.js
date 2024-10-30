"use client";
import { useEffect, useState } from "react";
import { Checkbox, Form, Input, Modal, Alert } from "antd";
import { useTranslations } from "next-intl";
import { TrashIcon, WarningIcon } from "../Icons";
import { api } from "@/lib";

const DeleteSessionModal = ({ open, setOpen, patSession, onDeleteSession }) => {
  const [deleting, setDeleting] = useState(false);

  const t = useTranslations("DeleteSession");
  const tc = useTranslations("common");
  const [form] = Form.useForm();

  const onFinish = async ({ id }) => {
    setDeleting(true);
    try {
      await api("DELETE", `/sessions?id=${id}`);
      onDeleteSession(id);
      form.resetFields();
      setOpen(false);
      setDeleting(false);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (
      patSession?.session_name &&
      patSession?.session_name !== form.getFieldValue("session_name")
    ) {
      form.setFieldValue("id", patSession.id);
      form.setFieldValue("session_name", patSession.session_name);
    }
  }, [form, patSession]);

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      maskClosable={false}
      width={768}
      onOk={() => form.submit()}
      okText={t("delete")}
      okButtonProps={{
        loading: deleting,
        icon: <TrashIcon />,
        iconPosition: "end",
      }}
      cancelButtonProps={{
        ghost: true,
      }}
    >
      <div className="w-full pb-6">
        <h1 className="text-xl font-bold">{t("title")}</h1>
      </div>
      <Form
        form={form}
        initialValues={patSession}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item name="session_name" label={t("labelText")}>
          <Input variant="borderless" className="readonly" disabled />
        </Form.Item>
        <Form.Item name="id">
          <Input type="hidden" />
        </Form.Item>
        <div className="w-full mb-4">
          <Alert
            message={
              patSession?.is_owner ? t("facilitatorText") : t("participantText")
            }
            type="error"
            icon={<WarningIcon />}
            showIcon
          />
        </div>
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
          <Checkbox>{t("checkboxText")}</Checkbox>
        </Form.Item>
      </Form>
      <div className="py-4 mt-6 border-dashed border-t border-dark-2" />
    </Modal>
  );
};

export default DeleteSessionModal;
