"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Form, Modal } from "antd";
import { SaveIcon } from "../Icons";
import { api, errorsMapping } from "@/lib";
import PATSessionForm from "../Forms/PATSessionForm";

const { useForm } = Form;

const EditSessionModal = ({ open, setClose, initialValues = {} }) => {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const [form] = useForm();

  const t = useTranslations("CreateSession");

  const onFinish = async (payload) => {
    setLoading(true);
    try {
      const {
        id: dataID,
        details,
        ...patSesion
      } = await api("PUT", `/sessions?id=${initialValues?.id}`, payload);
      if (dataID) {
        form.resetFields();
        setClose({
          ...patSesion,
          id: dataID,
        });
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
    <Modal
      open={open}
      onOk={() => {
        form.submit();
      }}
      onCancel={() => {
        form.resetFields();
        setClose();
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
      destroyOnClose
    >
      <h2 className="text-xl font-bold mb-8">{t("editTitle")}</h2>
      <PATSessionForm {...{ initialValues, form, onFinish, formErrors }} />
      <div className="py-2 mt-8 border-dashed border-t border-dark-2" />
    </Modal>
  );
};

export default EditSessionModal;
