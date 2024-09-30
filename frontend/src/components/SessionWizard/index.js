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
import { useSessionContext } from "@/context/SessionContextProvider";

const SessionWizard = ({ patSession, params, currentStep = 1 }) => {
  const { loading } = useSessionContext();

  const step = parseInt(currentStep) - 1;
  const router = useRouter();
  const formRef = useRef();
  const t = useTranslations("Session");

  const goTo = (s = 0) =>
    router.push(`/dashboard/sessions/${params.id}?step=${s}`);

  const goToNext = () => goTo(step + 2);

  const onClickNext = () => {
    if (formRef?.current) {
      formRef.current.submit();
    } else {
      goToNext();
    }
  };

  const onClickPublish = () => {
    console.info("fired!");
  };

  return (
    <>
      <div className="w-full bg-dashboard-session">
        <div className={classNames(openSans.variable, "container mx-auto")}>
          <SessionSteps current={step}>
            <SessionContent {...{ goToNext, step, patSession }} ref={formRef} />
          </SessionSteps>
        </div>
      </div>
      <div className="w-full flex container mx-auto pt-6">
        <div className="w-full lg:w-4/12" />
        <div className="w-full flex justify-between">
          <div className="min-w-32">
            <Button
              icon={<ArrowFatIcon left />}
              className="bg-light-1"
              disabled={!step}
              onClick={() => goTo(step)}
              block
              ghost
            >
              {t("back")}
            </Button>
          </div>
          <Space>
            <Button
              className="w-32 bg-light-1"
              onClick={() => {
                router.push("/dashboard");
              }}
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
