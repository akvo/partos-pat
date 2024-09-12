"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Modal } from "antd";

const JoinModal = () => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Dashboard");
  return (
    <>
      <Button onClick={() => setOpen(true)} ghost>
        {t("joinSession")}
      </Button>
      <Modal
        title={t("joinSession")}
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        closable
      />
    </>
  );
};

export default JoinModal;
