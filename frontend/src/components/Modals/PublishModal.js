"use client";

import { useState } from "react";
import { Button, Modal } from "antd";
import { useTranslations } from "next-intl";
import { FileArrowUpIcon } from "../Icons";

const PublishModal = ({ onPublish }) => {
  const [open, setOpen] = useState(false);

  const t = useTranslations("Session");

  const onClickPublish = () => {
    if (onPublish) {
      onPublish();
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        icon={<FileArrowUpIcon />}
        iconPosition="end"
        block
      >
        {t("publish")}
      </Button>
      <Modal
        open={open}
        onOk={onClickPublish}
        onCancel={() => setOpen(false)}
        maskClosable={false}
        width={768}
        closable
      />
    </>
  );
};

export default PublishModal;
