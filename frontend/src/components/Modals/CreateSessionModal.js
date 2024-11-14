"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Form, Modal } from "antd";
import { FolderSimplePlus, SaveIcon } from "../Icons";
import { api, errorsMapping } from "@/lib";
import PATSessionForm from "../Forms/PATSessionForm";
import { useRouter } from "@/routing";

const { useForm } = Form;

const CreateSessionModal = ({ disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [form] = useForm();

  const t = useTranslations("CreateSession");
  const td = useTranslations("Dashboard");
  const router = useRouter();

  const onFinish = async (payload) => {
    setLoading(true);
    try {
      const { id: dataID, details } = await api("POST", "/sessions", payload);
      if (dataID) {
        form.resetFields();
        setOpen(false);
        router.refresh("/dashboard");
        router.replace(`/dashboard?session=${dataID}`);
      }
      const _errors = errorsMapping(details);
      if (_errors.length) {
        setFormErrors(_errors);
        form.setFields(_errors);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary" disabled={disabled}>
        {td("newPATSession")} <FolderSimplePlus />
      </Button>
      <Modal
        open={open}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          form.resetFields();
          setOpen(false);
          setFormErrors([]);
        }}
        okText={t("save")}
        okButtonProps={{
          icon: <SaveIcon />,
          iconPosition: "end",
          loading,
          style: {
            padding: "10px 20px",
            fontSize: 16,
          },
        }}
        cancelText={t("cancel")}
        cancelButtonProps={{
          ghost: true,
          style: {
            padding: "10px 20px",
            fontSize: 16,
          },
        }}
        maskClosable={false}
        closable
        width={1366}
      >
        <h2 className="text-xl font-bold mb-8">{t("title")}</h2>
        <PATSessionForm {...{ form, onFinish, formErrors }} />
        <div className="py-2 mt-8 border-dashed border-t border-dark-2" />
      </Modal>
    </>
  );
};

export default CreateSessionModal;
