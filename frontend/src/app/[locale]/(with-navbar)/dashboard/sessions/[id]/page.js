"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HorizontalDivider, SessionWizard } from "@/components";
import { api } from "@/lib";
import { useParams } from "next/navigation";
import { useRouter } from "@/routing";
import dayjs from "dayjs";
import { Alert } from "antd";
import { WarningIcon } from "@/components/Icons";

const SessionDetailsPage = () => {
  const [patSession, setPatSession] = useState(null);
  const [pending, setPending] = useState(true);
  const [accessible, setAccessible] = useState(true);
  const params = useParams();
  const router = useRouter();

  const t = useTranslations("Dashboard");

  const loadPatSession = useCallback(async () => {
    try {
      const response = await api("GET", `/sessions?id=${params.id}`);
      if (!response?.id) {
        router.replace("/not-found");
      }
      if (dayjs().format("DD-MM-YYYY") < response?.date) {
        setAccessible(false);
        setPending(false);
      }
      setPatSession(response);
    } catch (err) {
      console.error(err);
    }
  }, [params.id, router]);

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
      <div className="w-full mb-4">
        {!accessible && (
          <Alert
            message={
              <div className="container w-full flex flex-row items-center gap-2">
                <WarningIcon />
                <span>{t("alertInActive")}</span>
              </div>
            }
            className="pat-session-alert"
            type="warning"
            icon={<i />}
            showIcon
          />
        )}
      </div>
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
      <SessionWizard {...{ accessible, patSession, params, setPending }} />
    </div>
  );
};

export default SessionDetailsPage;
