"use client";

import { api } from "@/lib";
import { Avatar, Button, Flex, message, Modal, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import countryOptions from "../../../i18n/countries.json";
import { CopyIcon } from "../Icons";
import { useRouter } from "@/routing";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import FacilitatorAvatar from "../FacilitatorAvatar";
import { SESSION_PURPOSE } from "@/static/config";

const MAX_COUNTRIES = 5;

dayjs.extend(customParseFormat);

const Section = ({ children }) => (
  <div className="w-full py-3 space-y-5 border-b border-dark-2 text-base">
    {children}
  </div>
);

const DetailSessionModal = ({ id, webdomain }) => {
  const [details, setDetails] = useState(null);
  const [preload, setPreload] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const t = useTranslations("SessionDetails");
  const t_common = useTranslations("common");

  const handleOnClose = () => {
    setOpen(false);
    router.replace("/dashboard");
    setTimeout(() => {
      setPreload(true);
    }, 500);
  };

  const handleOnCopy = () => {
    if (details?.join_code) {
      const content = document.getElementById(`copy-content-${id}`).innerHTML;
      navigator.clipboard
        .write([
          new ClipboardItem({
            "text/html": new Blob([content], { type: "text/html" }),
            "text/plain": new Blob([content], { type: "text/plain" }),
          }),
        ])
        .then(() => {
          message.success(t("copySuccess"));
        });
    }
  };

  const loadDetails = useCallback(async () => {
    if (preload && id) {
      setPreload(false);
      try {
        const data = await api("GET", `/sessions?id=${id}`);
        setDetails(data);
        setOpen(true);
      } catch {
        router.push("/dashboard");
      }
    }
  }, [id, preload, router]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const countries = countryOptions.filter((c) =>
    details?.countries?.includes(c?.["alpha-2"]),
  );

  return (
    <Modal
      title={<span className="font-normal">{t("title")}</span>}
      open={open}
      onCancel={handleOnClose}
      okButtonProps={{
        style: {
          display: "none",
        },
      }}
      cancelButtonProps={{
        style: {
          display: "none",
        },
      }}
      maskClosable={false}
      width={1366}
      closable
    >
      <Flex
        align="center"
        justify="space-between"
        className="pt-1.5 pb-3 border-b border-dark-2"
      >
        <div>
          <h2 className="font-bold text-2xl">{details?.session_name}</h2>
        </div>
        <div>
          <strong className="font-bold">
            {dayjs(details?.date, "DD-MM-YYYY").format("DD/MM/YYYY")}
          </strong>
        </div>
      </Flex>
      <Section>
        <h3 className="font-bold">{t("partnerOrg")}</h3>
      </Section>
      <div className="w-full pb-6 space-y-5 border-b border-dark-2 text-base">
        <ul className="w-full flex flex-col flex-wrap md:flex-row border-b border-light-grey-5">
          {details?.organizations?.map((item) => (
            <li
              className="w-full md:w-1/4 flex gap-3 px-3 py-2 odd:bg-light-grey-5 even:bg-light-1"
              key={item?.id}
            >
              <Avatar className="org">{item?.name?.[0]}</Avatar>
              <div>
                <strong className="text-grey-900">{item?.acronym}</strong>
                <p className="overflow-x-hidden text-sm text-ellipsis text-grey-600">
                  {item?.name}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Section>
        <Flex justify="space-between" align="center">
          <strong className="font-bold">{t("purpose")}</strong>
          <div>
            {SESSION_PURPOSE?.[details?.purpose]
              ? t_common.rich(SESSION_PURPOSE[details.purpose], {
                  b: (token) => <b>{token}</b>,
                })
              : details?.other_purpose}
          </div>
        </Flex>
      </Section>
      <Section>
        <Flex justify="space-between" align="center">
          <strong className="font-bold">{t("countries")}</strong>
          <div>
            <ul>
              {countries?.slice(0, 5)?.map((c) => (
                <li
                  key={c["alpha-2"]}
                  className="inline mr-4 bg-light-4 border border-dark-7 text-dark-7 text-sm font-semibold py-1.5 px-5 rounded-full"
                >
                  {c?.name}
                </li>
              ))}
              {countries?.length > MAX_COUNTRIES && (
                <Tooltip
                  title={
                    <ul>
                      {countries
                        .slice(MAX_COUNTRIES, countries.length)
                        .map((c, cx) => (
                          <li key={cx}>{`* ${c?.name}`}</li>
                        ))}
                    </ul>
                  }
                >
                  <li className="inline bg-light-4 border border-dark-7 text-dark-7 text-sm font-semibold py-1.5 px-2.5 rounded-full cursor-pointer">
                    {`${countries?.length - MAX_COUNTRIES}+`}
                  </li>
                </Tooltip>
              )}
            </ul>
          </div>
        </Flex>
      </Section>
      <Section>
        <strong className="font-bold">{t("inviteCode")}</strong>
        <div className="text-center pt-6 pb-12">
          <h4 className="font-bold text-5xl">{details?.join_code}</h4>
        </div>
        {details?.join_code && (
          <div id={`copy-content-${id}`} className="hidden whitespace-pre-line">
            {t.rich("copyContent", {
              name: () => <p>{details?.session_name}</p>,
              org: () => (
                <i>
                  {details?.organizations?.map((o) => o?.acronym)?.join(", ")}
                </i>
              ),
              context: () => <p>{details?.context}</p>,
              code: () => <b>{details.join_code}</b>,
              url: () => (
                <a href={webdomain} target="_blank">
                  {webdomain}
                </a>
              ),
            })}
          </div>
        )}
      </Section>
      <Section>
        <strong className="font-bold">{t("context")}</strong>
        <div className="pb-6">
          <p className="text-dark-7">{details?.context}</p>
        </div>
      </Section>
      <Flex className="mt-6" justify="space-between" align="center">
        <div>
          <FacilitatorAvatar {...details?.facilitator} />
        </div>
        <div>
          <Button
            type="primary"
            onClick={handleOnCopy}
            icon={<CopyIcon />}
            iconPosition="end"
          >
            {t("copyCodeButton")}
          </Button>
        </div>
      </Flex>
    </Modal>
  );
};

export default DetailSessionModal;
