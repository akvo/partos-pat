"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HorizontalDivider, SessionWizard } from "@/components";
import { api } from "@/lib";
import { useParams } from "next/navigation";

const SessionDetailsPage = () => {
  const [patSession, setPatSession] = useState(null);
  const [pending, setPending] = useState(true);
  const params = useParams();
  const t = useTranslations("Dashboard");

  const loadPatSession = useCallback(async () => {
    try {
      const response = await api("GET", `/sessions?id=${params.id}`);
      setPatSession(response);
    } catch (err) {
      console.error(err);
    }
  }, [params.id]);

  useEffect(() => {
    loadPatSession();
  }, [loadPatSession]);

  useEffect(() => {
    if (!pending) return;

    function beforeUnload(e) {
      e.preventDefault();
    }

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [pending]);

  return (
    <div className="w-full space-y-4">
      <div className="container mx-auto pt-2">
        <HorizontalDivider>
          <div className="pr-3">
            <a href={`/${params.locale}/dashboard`}>{t("dashboard")}</a>
          </div>
          <div className="px-3">
            <strong className="font-bold text-base">
              {patSession?.session_name}
            </strong>
          </div>
        </HorizontalDivider>
      </div>
      <SessionWizard {...{ patSession, params, setPending }} />
    </div>
  );
};

export default SessionDetailsPage;
