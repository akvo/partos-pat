"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Modal } from "antd";
import { FolderSimplePlus } from "../Icons";

const CreateSessionModal = () => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Dashboard");
  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        {t("newPATSession")} <FolderSimplePlus />
      </Button>
      <Modal
        title={t("newPATSession")}
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        closable
        width={1366}
      >
        {t("newPATSession")}
      </Modal>
    </>
  );
};

export default CreateSessionModal;
