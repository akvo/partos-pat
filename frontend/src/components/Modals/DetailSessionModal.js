"use client";

import { api } from "@/lib";
import { Modal } from "antd";
import { useCallback, useEffect, useState } from "react";

const DetailSessionModal = ({ id }) => {
  const [details, setDetails] = useState(null);
  const [preload, setPreload] = useState(true);
  const [open, setOpen] = useState(false);

  const loadDetails = useCallback(async () => {
    if (preload && id) {
      setPreload(false);
      setOpen(true);
      const data = await api("GET", `/sessions?id=${id}`);
      setDetails(data);
    }
  }, [id, preload]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  return (
    <Modal
      title={details?.session_name || ""}
      open={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      maskClosable={false}
      width={1366}
      closable
    />
  );
};

export default DetailSessionModal;
