"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HorizontalDivider, SessionWizard } from "@/components";
import { api } from "@/lib";
import { useParams } from "next/navigation";
import { useRouter } from "@/routing";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Alert } from "antd";
import { WarningIcon } from "@/components/Icons";
import classNames from "classnames";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

const SessionDetailsPage = () => {
  const [patSession, setPatSession] = useState(null);
  const [pending, setPending] = useState(true);
  const [readyToPublish, setReadyToPublish] = useState(true);
  const params = useParams();
  const router = useRouter();

  const t = useTranslations("Dashboard");

  const loadPatSession = useCallback(async () => {
    try {
      const response = await api("GET", `/sessions?id=${params.id}`);
      if (!response?.id) {
        router.replace("/not-found");
      }
      if (dayjs(response?.date).isValid()) {
        const _readyToPublish = dayjs().isSameOrAfter(
          dayjs(response.date, "DD-MM-YYYY").format("YYYY-MM-DD"),
        );
        setReadyToPublish(_readyToPublish);
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
      <div className="w-full">
        {!readyToPublish && (
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
        <div
          className={classNames("container mx-auto", {
            "pt-0": !readyToPublish,
            "pt-2": readyToPublish,
          })}
        >
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
      </div>
      <SessionWizard {...{ readyToPublish, patSession, params, setPending }} />
    </div>
  );
};

export default SessionDetailsPage;
