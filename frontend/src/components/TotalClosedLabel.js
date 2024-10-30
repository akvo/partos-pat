"use client";

import { useSessionContext } from "@/context/SessionContextProvider";
import { Space } from "antd";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const TotalClosedLabel = ({ initialTotalClosed = 0 }) => {
  const t = useTranslations("Dashboard");

  const sessionContext = useSessionContext();
  const { totalClosed, filterSubmitted } = sessionContext;

  const total = useMemo(() => {
    return filterSubmitted ? totalClosed : totalClosed || initialTotalClosed;
  }, [totalClosed, filterSubmitted, initialTotalClosed]);

  return (
    <Space>
      <span>{t("closedSessions")}</span>
      <span className="badge-number py-px px-2 border border-dark-2 rounded-full">
        {total}
      </span>
    </Space>
  );
};

export default TotalClosedLabel;
