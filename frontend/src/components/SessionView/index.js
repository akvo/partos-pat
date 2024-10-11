"use client";

import { useRef, useCallback, useEffect } from "react";
import { Button, Space } from "antd";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { openSans, sourceSansPro } from "@/app/fonts";

import { ArrowFatIcon, FileArrowDownIcon } from "../Icons";
import SessionContent from "./SessionContent";
import SessionSteps from "../SessionWizard/SessionSteps";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { api } from "@/lib";
import { PAT_SESSION } from "@/static/config";

const SessionView = ({ patSession }) => {
  const sessionDispatch = useSessionDispatch();
  const sessionContext = useSessionContext();
  const { step } = sessionContext;
  const { fetched } = sessionContext.decisions;
  const { fetched: commentFetched } = sessionContext.comments;

  const formRef = useRef();
  const t = useTranslations("Session");

  const loadDecisions = useCallback(async () => {
    if (!fetched && patSession?.id) {
      try {
        const resData = await api(
          "GET",
          `/decisions?session_id=${patSession.id}`,
        );
        sessionDispatch({
          type: "DECISION_UPDATE",
          payload: resData,
        });
        sessionDispatch({
          type: "DECISION_FETCHED",
        });
      } catch {
        sessionDispatch({
          type: "DECISION_FETCHED",
        });
      }
    }
  }, [patSession, fetched, sessionDispatch]);

  const loadComments = useCallback(async () => {
    if (!commentFetched && patSession?.id) {
      try {
        const { data: dataComments } = await api(
          "GET",
          `/session/${patSession.id}/comments`,
        );
        sessionDispatch({
          type: "COMMENT_UPDATE",
          payload: dataComments,
        });
        sessionDispatch({
          type: "COMMENT_FETCHED",
        });
      } catch (err) {
        console.error(err);
        sessionDispatch({
          type: "COMMENT_FETCHED",
        });
      }
    }
  }, [patSession, commentFetched, sessionDispatch]);

  /**
   * Get all session decisions
   */
  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  /**
   * Get all session comments
   */
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <div
      className={classNames(
        openSans.variable,
        openSans.className,
        "w-full h-full",
      )}
    >
      <div className="w-full container mx-auto mb-3">
        <h2
          className={classNames(sourceSansPro.className, "font-bold text-lg")}
        >
          {`${step + 1}.  `}
          {t(`titleStep${parseInt(step + 1)}`)}
        </h2>
      </div>

      <div className="w-full 2xl:h-[calc(100vh-315px)] bg-dashboard-session">
        <div className="w-full h-full container mx-auto">
          <SessionSteps current={step}>
            <SessionContent {...{ step, patSession }} ref={formRef} />
          </SessionSteps>
        </div>
      </div>
      <div className="w-full flex container mx-auto pt-4">
        <div className="w-full lg:w-4/12" />
        <div className="w-full flex justify-between">
          <div className="min-w-32">
            {step < PAT_SESSION.totalSteps - 1 && (
              <Button
                icon={<FileArrowDownIcon />}
                iconPosition="end"
                className="bg-light-1"
                block
                ghost
              >
                {t("downloadPdf")}
              </Button>
            )}
          </div>
          <Space>
            <Button
              icon={<ArrowFatIcon left />}
              className="w-28 bg-light-1"
              onClick={() => {
                sessionDispatch({
                  type: "STEP_BACK",
                });
              }}
              disabled={!step}
              ghost
            >
              {t("back")}
            </Button>
            {step === PAT_SESSION.totalSteps - 1 && (
              <Button
                type="primary"
                icon={<FileArrowDownIcon />}
                iconPosition="end"
                block
              >
                {t("downloadPdf")}
              </Button>
            )}
            {step < PAT_SESSION.totalSteps - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  sessionDispatch({
                    type: "STEP_NEXT",
                  });
                }}
                icon={<ArrowFatIcon />}
                iconPosition="end"
                className="w-28"
              >
                {t("next")}
              </Button>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};

export default SessionView;
