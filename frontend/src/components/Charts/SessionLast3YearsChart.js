"use client";

import { PAT_COLORS } from "@/static/config";
import { Line } from "akvo-charts";
import { useMemo } from "react";
import { graphic } from "echarts";

const SessionLast3YearsChart = ({ data = [] }) => {
  const rawConfig = useMemo(() => {
    const dataSource = data.map((d, dx) => ({
      data: d?.total_sessions,
      type: "line",
      name: d?.year,
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: PAT_COLORS.SESSION_LAST_3_YEARS[dx]?.[0],
          },
          {
            offset: 1,
            color: PAT_COLORS.SESSION_LAST_3_YEARS[dx]?.[1],
          },
        ]),
      },
      color: PAT_COLORS.SESSION_LAST_3_YEARS[dx]?.[0],
    }));
    return {
      tooltip: {
        trigger: "item",
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      yAxis: {
        type: "value",
      },
      legend: {
        show: true,
        left: "right",
        orient: "horizontal",
      },
      series: dataSource,
    };
  }, [data]);

  return (
    <div className="w-full session-last-3y-chart">
      <Line rawConfig={rawConfig} />
    </div>
  );
};

export default SessionLast3YearsChart;
