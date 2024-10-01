"use client";

import { useMemo } from "react";
import { Steps } from "antd";
import { useTranslations } from "next-intl";
import { PAT_SESSION } from "@/static/config";

const SessionSteps = ({ children, current }) => {
  const t = useTranslations("Session");
  const items = useMemo(() => {
    return Array.from({ length: PAT_SESSION.totalSteps }).map((_, sx) => {
      const isCompleted = current > sx;
      return {
        title: t(`menuStep${sx + 1}`),
        description:
          current === sx
            ? "In progress"
            : isCompleted
              ? "Completed"
              : "Not Started",
      };
    });
  }, [current, t]);

  return (
    <>
      <div className="w-full 2xl:h-full flex">
        <aside className="w-full 2xl:h-full lg:w-4/12 py-6">
          <Steps current={current} direction="vertical" items={items} />
        </aside>
        <div className="w-full 2xl:h-full bg-light-1 px-8 py-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default SessionSteps;
