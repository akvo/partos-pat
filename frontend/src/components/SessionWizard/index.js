"use client";

import { useRef } from "react";
import { Button, Space } from "antd";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { useRouter } from "@/routing";
import { openSans } from "@/app/fonts";

import { ArrowFatIcon, FileArrowUpIcon } from "../Icons";
import SessionContent from "./SessionContent";
import SessionSteps from "./SessionSteps";
import { PAT_SESSION } from "@/static/config";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";

const SessionWizard = ({ patSession }) => {
  const sessionDispatch = useSessionDispatch();
  const { loading, saving, step } = useSessionContext();

  const router = useRouter();
  const formRef = useRef();
  const t = useTranslations("Session");

  const onClickNext = () => {
    sessionDispatch({
      type: "LOADING_TRUE",
    });
    if (formRef?.current) {
      formRef.current.submit();
      if (!loading) {
        sessionDispatch({
          type: "STEP_NEXT",
        });
      }
    } else {
      sessionDispatch({
        type: "STEP_NEXT",
      });
    }
  };

  const onClickSave = () => {
    sessionDispatch({
      type: "SAVING_TRUE",
    });
    if (formRef?.current) {
      formRef.current.submit();
      if (!saving) {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  const onClickPublish = () => {
    console.info("fired!");
  };

  return (
    <>
      <div className="w-full container mx-auto">
        <h2 className="font-bold text-lg">
          {t(`titleStep${parseInt(step + 1)}`)}
        </h2>
      </div>

      <div className="w-full 2xl:h-[calc(100vh-315px)] bg-dashboard-session">
        <div
          className={classNames(
            openSans.variable,
            "w-full h-full container mx-auto"
          )}
        >
          <SessionSteps current={step}>
            <SessionContent {...{ step, patSession }} ref={formRef} />
          </SessionSteps>
        </div>
      </div>
      <div className="w-full flex container mx-auto pt-4">
        <div className="w-full lg:w-4/12" />
        <div className="w-full flex justify-between">
          <div className="min-w-32">
            <Button
              icon={<ArrowFatIcon left />}
              className="bg-light-1"
              disabled={!step}
              onClick={() => {
                sessionDispatch({
                  type: "STEP_BACK",
                });
              }}
              block
              ghost
            >
              {t("back")}
            </Button>
          </div>
          <Space>
            <Button
              className="w-32 bg-light-1"
              onClick={onClickSave}
              loading={saving}
              ghost
            >
              {t("saveNExit")}
            </Button>
            <div className="min-w-32">
              {step === PAT_SESSION.totalSteps - 1 ? (
                <Button
                  type="primary"
                  onClick={onClickPublish}
                  icon={<FileArrowUpIcon />}
                  iconPosition="end"
                  block
                >
                  {t("publish")}
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={onClickNext}
                  icon={<ArrowFatIcon />}
                  iconPosition="end"
                  loading={loading}
                  block
                >
                  {t("next")}
                </Button>
              )}
            </div>
          </Space>
        </div>
      </div>
    </>
  );
};

export default SessionWizard;
