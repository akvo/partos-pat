"use client";

import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { Space } from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const TotalActiveLabel = ({ defaultValue = 0 }) => {
  const [preload, setPreload] = useState(true);

  const t = useTranslations("Dashboard");

  const sessionDispatch = useSessionDispatch();
  const { totalActive } = useSessionContext();

  useEffect(() => {
    if (preload) {
      setPreload(false);
      sessionDispatch({
        type: "TOTAL_ACTIVE_UPDATE",
        payload: defaultValue,
      });
    }
  }, [preload, sessionDispatch, defaultValue]);

  return (
    <Space>
      <span>{t("activeSessions")}</span>
      <span className="badge-number py-px px-2 border border-dark-2 rounded-full">
        {totalActive}
      </span>
    </Space>
  );
};

export default TotalActiveLabel;
