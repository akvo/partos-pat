"use client";

import { useTranslations } from "next-intl";

const StepTwo = () => {
  const t = useTranslations("Session");
  return (
    <div className="w-full space-y-6">
      <div className="w-full space-y-4 whitespace-pre-line">
        <strong>{t("step2Title")}</strong>
        <p>{t("step2Desc")}</p>
      </div>
    </div>
  );
};
export default StepTwo;
