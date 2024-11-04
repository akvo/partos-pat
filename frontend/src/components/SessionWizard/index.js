"use client";

import { useRef, useCallback, useEffect } from "react";
import { Button, Modal, Space } from "antd";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { useRouter } from "@/routing";
import { openSans, sourceSansPro } from "@/app/fonts";

import { ArrowFatIcon } from "../Icons";
import SessionContent from "./SessionContent";
import SessionSteps from "./SessionSteps";
import { PAT_SESSION } from "@/static/config";
import {
  useSessionContext,
  useSessionDispatch,
} from "@/context/SessionContextProvider";
import { PublishModal } from "../Modals";
import { api } from "@/lib";

const SessionWizard = ({ accessible, patSession, setPending }) => {
  const sessionDispatch = useSessionDispatch();
  const sessionContext = useSessionContext();
  const { loading, saving, step } = sessionContext;
  const { fetched } = sessionContext.decisions;
  const { fetched: commentFetched } = sessionContext.comments;

  const router = useRouter();
  const formRef = useRef();
  const t = useTranslations("Session");

  const onClickNext = async () => {
    if (formRef?.current && patSession?.is_owner) {
      try {
        await formRef.current.validateFields();
        formRef.current.submit();
        sessionDispatch({
          type: "LOADING_TRUE",
        });
      } catch ({ errorFields }) {
        formRef.current.setFields(errorFields);
      }
    } else {
      sessionDispatch({
        type: "STEP_NEXT",
      });
    }
  };

  const onClickSave = async () => {
    if (formRef.current) {
      try {
        await formRef.current.validateFields();
        formRef.current.submit();
        sessionDispatch({
          type: "SAVING_TRUE",
        });
        if (!saving) {
          setPending(false);
          router.push("/dashboard");
          sessionDispatch({
            type: "RESET",
          });
        }
      } catch ({ errorFields }) {
        formRef.current.setFields(errorFields);
      }
    } else {
      router.push("/dashboard");
    }
  };

  const onClickComment = async () => {
    if (formRef.current) {
      try {
        await formRef.current.validateFields();
        formRef.current.submit();
        Modal.success({
          content: t("successComment"),
          okButtonProps: {
            className: "simple",
          },
        });
        setPending(false);
      } catch ({ errorFields }) {
        formRef.current.setFields(errorFields);
      }
    }
  };

  const onPublish = async () => {
    if (formRef.current) {
      try {
        await formRef.current.validateFields();
        formRef.current.submit();
        setPending(false);
      } catch ({ errorFields }) {
        formRef.current.setFields(errorFields);
      }
    }
  };

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
            <SessionContent
              {...{ accessible, step, patSession }}
              ref={formRef}
            />
          </SessionSteps>
        </div>
      </div>
      <div className="w-full flex container mx-auto pt-4">
        <div className="w-full lg:w-4/12" />

        {patSession?.is_owner ? (
          <div className="w-full flex justify-between">
            <div className="min-w-32">
              <Button
                icon={<ArrowFatIcon left />}
                className="w-28 bg-light-1"
                disabled={!step}
                onClick={() => {
                  sessionDispatch({
                    type: "STEP_BACK",
                  });
                }}
                ghost
              >
                {t("back")}
              </Button>
            </div>
            <Space>
              <Button
                className="w-fit bg-light-1"
                onClick={onClickSave}
                loading={saving}
                disabled={!accessible}
                ghost
              >
                {t("saveNExit")}
              </Button>
              <div className="min-w-32">
                {step === PAT_SESSION.totalSteps - 1 ? (
                  <PublishModal onPublish={onPublish} patSession={patSession} />
                ) : (
                  <Button
                    type="primary"
                    onClick={onClickNext}
                    icon={<ArrowFatIcon />}
                    iconPosition="end"
                    loading={loading}
                    className="w-28"
                    disabled={!accessible}
                  >
                    {t("next")}
                  </Button>
                )}
              </div>
            </Space>
          </div>
        ) : (
          <>
            {step < PAT_SESSION.totalSteps - 1 ? (
              <div className="w-full flex justify-between">
                <div className="min-w-32">
                  <Button
                    icon={<ArrowFatIcon left />}
                    className="w-28 bg-light-1"
                    disabled={!step}
                    onClick={() => {
                      sessionDispatch({
                        type: "STEP_BACK",
                      });
                    }}
                    ghost
                  >
                    {t("back")}
                  </Button>
                </div>
                <div>
                  <Button
                    type="primary"
                    onClick={onClickNext}
                    icon={<ArrowFatIcon />}
                    iconPosition="end"
                    loading={loading}
                    className="w-28"
                    disabled={!accessible}
                  >
                    {t("next")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-end">
                <Space>
                  <Button
                    icon={<ArrowFatIcon left />}
                    className="w-28 bg-light-1"
                    onClick={() => {
                      sessionDispatch({
                        type: "STEP_BACK",
                      });
                    }}
                    ghost
                  >
                    {t("back")}
                  </Button>
                  <Button
                    type="primary"
                    onClick={onClickComment}
                    loading={saving}
                    disabled={!accessible}
                    block
                  >
                    {t("submitComments")}
                  </Button>
                </Space>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionWizard;
