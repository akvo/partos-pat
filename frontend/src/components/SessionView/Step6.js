"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { useUserContext } from "@/context/UserContextProvider";

const StepSix = ({ patSession }, ref) => {
  const t = useTranslations("Session");
  const sessionDispatch = useSessionDispatch();
  const sessionContext = useSessionContext();
  const userContext = useUserContext();
  const { data: comments } = sessionContext?.comments || { data: [] };

  return (
    <div className="w-full space-y-6">
      {patSession?.is_owner && <strong>{t("step6Title")}</strong>}
    </div>
  );
};
export default forwardRef(StepSix);
