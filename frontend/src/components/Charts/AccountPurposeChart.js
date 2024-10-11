"use client";

import { PAT_COLORS } from "@/static/config";
import { Doughnut } from "akvo-charts";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const AccountPurposeChart = ({ data = [] }) => {
  const t = useTranslations("common");

  const rawConfig = useMemo(() => {
    const dataSource = data.map((d) => ({
      value: d.total,
      name: t(d.account_purpose)
    }));
    return {
      tooltip: {
        trigger: "item"
      },
      legend: {
        show: false
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2
          },
          label: {
            show: false,
            position: "center"
          },
          labelLine: {
            show: false
          },
          data: dataSource
        }
      ],
      color: PAT_COLORS.ACCOUNT_PURPOSE
    }
  }, [data, t]);



  return (
    <div className="w-full account-purpose-chart">
      <Doughnut rawConfig={rawConfig} />
    </div>
  );
};

export default AccountPurposeChart;
