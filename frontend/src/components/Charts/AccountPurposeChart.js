"use client";

import { PAT_COLORS } from "@/static/config";
import { Doughnut } from "akvo-charts";
import { useMemo } from "react";

const AccountPurposeChart = ({ data = [] }) => {
  const rawConfig = useMemo(() => {
    const dataSource = data.map((d) => ({
      value: d.total,
      name: d.category,
    }));
    return {
      tooltip: {
        trigger: "item",
      },
      legend: {
        show: false,
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          labelLine: {
            show: false,
          },
          data: dataSource,
        },
      ],
      color: PAT_COLORS.SESSION_CATEGORY,
    };
  }, [data]);

  return (
    <div className="w-full account-purpose-chart">
      <Doughnut rawConfig={rawConfig} />
    </div>
  );
};

export default AccountPurposeChart;
