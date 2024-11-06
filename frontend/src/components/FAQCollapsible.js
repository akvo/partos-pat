"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Collapse } from "antd";
import { MinusCircleIcon, PlusCircleIcon } from "./Icons";
import classNames from "classnames";
import { PARTOS } from "@/static/config";

const FAQCollapsible = ({
  wrapClass = "w-full flex flex-col items-center justify-center",
  contentClass = "w-full lg:w-8/12",
  center = true,
  defaultActiveKey = ["1"],
  isPublic = false,
  question = null,
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const t = useTranslations("FAQ");

  const items = [
    {
      key: "1",
      label: t("question1"),
      children: <p className="whitespace-pre-line">{t("answer1")}</p>,
      public: "true",
    },
    {
      key: "2",
      label: t("question2"),
      children: (
        <div className="whitespace-pre-line">
          <p>{t("answer2")}</p>
          <ul className="list-disc ml-8">
            <li>
              {t.rich("answer2a", {
                b: (token) => <b>{token}</b>,
              })}
            </li>
            <li>
              {t.rich("answer2b", {
                b: (token) => <b>{token}</b>,
              })}
            </li>
          </ul>
        </div>
      ),
      public: "true",
    },
    {
      key: "3",
      label: t("question3"),
      children: <p>{t("answer3")}</p>,
      public: "true",
    },
    {
      key: "4",
      label: t("question4"),
      children: <p className="whitespace-pre-line">{t("answer4")}</p>,
      public: "true",
    },
    {
      key: "5",
      label: t("question5"),
      children: (
        <div className="whitespace-pre-line">
          <p>{t("answer5")}</p>
          <ul className="list-disc ml-8">
            <li>{t("answer5a")}</li>
            <li>{t("answer5b")}</li>
            <li>{t("answer5c")}</li>
          </ul>
        </div>
      ),
      public: "true",
    },
    {
      key: "6",
      label: t("question6"),
      children: (
        <div className="whitespace-pre-line">
          <p>{t("answer6")}</p>
          <ul className="list-disc ml-8">
            <li>{t("answer6a")}</li>
            <li>{t("answer6b")}</li>
            <li>{t("answer6c")}</li>
            <li>{t("answer6d")}</li>
          </ul>
        </div>
      ),
      public: "true",
    },
    {
      key: "7",
      label: t("question7"),
      children: (
        <p className="whitespace-pre-line">
          {t.rich("answer7", {
            link: (token) => (
              <a
                href={PARTOS.PATGuidelineLink}
                target="_blank"
                className="text-dark-10 font-bold underline hover:text-primary-dark"
              >
                {token}
              </a>
            ),
          })}
        </p>
      ),
      public: "true",
    },
    {
      key: "8",
      label: t("question8"),
      children: <p className="whitespace-pre-line">{t("answer8")}</p>,
      public: "true",
    },
    {
      key: "9",
      label: t("question9"),
      children: <p className="whitespace-pre-line">{t("answer9")}</p>,
      public: "false",
    },
    {
      key: "10",
      label: t("question10"),
      children: <p className="whitespace-pre-line">{t("answer10")}</p>,
      public: "false",
    },
    {
      key: "11",
      label: t("question11"),
      children: (
        <div className="whitespace-pre-line">
          <p>{t("answer11")}</p>
          <ul className="list-disc ml-8">
            <li>
              {t.rich("answer11a", {
                b: (token) => <b>{token}</b>,
              })}
            </li>
            <li>{t("answer11b")}</li>
            <li>
              {t.rich("answer11c", {
                b: (token) => <b>{token}</b>,
              })}
            </li>
            <li>
              {t.rich("answer11d", {
                b: (token) => <b>{token}</b>,
              })}
            </li>
          </ul>
        </div>
      ),
      public: "true",
    },
    {
      key: "12",
      label: t("question12"),
      children: (
        <div className="whitespace-pre-line">
          <p>{t("answer12")}</p>
          <ul className="list-disc ml-8">
            <li>{t("answer12a")}</li>
            <li>{t("answer12b")}</li>
            <li>{t("answer12c")}</li>
          </ul>
          <p>{t("answer12End")}</p>
        </div>
      ),
      public: "false",
    },
    {
      key: "13",
      label: t("question13"),
      children: (
        <p className="whitespace-pre-line">
          {t.rich("answer13", {
            b: (token) => <b>{token}</b>,
          })}
        </p>
      ),
      public: "true",
    },
    {
      key: "14",
      label: t("question14"),
      children: <p className="whitespace-pre-line">{t("answer14")}</p>,
      public: "false",
    },
    {
      key: "15",
      label: t("question15"),
      children: (
        <div className="whitespace-pre-line">
          <p>{t("answer15")}</p>
          <ul className="list-disc ml-8">
            <li>{t("answer15a")}</li>
            <li>{t("answer15b")}</li>
          </ul>
        </div>
      ),
      public: "false",
    },
    {
      key: "16",
      label: t("question16"),
      children: (
        <p className="whitespace-pre-line">
          {t.rich("answer16", {
            b: (token) => <b>{token}</b>,
          })}
        </p>
      ),
      public: "false",
    },
    {
      key: "17",
      label: t("question17"),
      children: <p className="whitespace-pre-line">{t("answer17")}</p>,
      public: "true",
    },
    {
      key: "18",
      label: t("question18"),
      children: (
        <div className="whitespace-pre-line">
          <p>{t("answer18")}</p>
          <ul className="list-disc ml-8">
            <li>{t("answer18a")}</li>
            <li>{t("answer18b")}</li>
            <li>{t("answer18c")}</li>
          </ul>
          <p>{t("answer18End")}</p>
        </div>
      ),
      public: "true",
    },
    {
      key: "19",
      label: t("question19"),
      children: <p className="whitespace-pre-line">{t("answer19")}</p>,
      public: "false",
    },
    {
      key: "20",
      label: t("question20"),
      children: <p className="whitespace-pre-line">{t("answer20")}</p>,
      public: "true",
    },
    {
      key: "21",
      label: t("question21"),
      children: (
        <p className="whitespace-pre-line">
          {t.rich("answer21", {
            b: (token) => <b>{token}</b>,
          })}
        </p>
      ),
      public: "true",
    },
    {
      key: "22",
      label: t("question22"),
      children: (
        <p className="whitespace-pre-line">
          {t.rich("answer22", {
            link: (token) => (
              <a
                href={PARTOS.PATGuidelineLink}
                target="_blank"
                className="text-dark-10 font-bold underline hover:text-primary-dark"
              >
                {token}
              </a>
            ),
          })}
        </p>
      ),
      public: "true",
    },
  ];

  useEffect(() => {
    const findKey = activeKey?.find((k) => question === k);
    if (question && !findKey && activeKey?.length) {
      setActiveKey([...activeKey, question]);
    }
  }, [question, activeKey]);

  return (
    <div className={wrapClass}>
      <div
        className={classNames("w-full text-dark-10 space-y-5 mb-16", {
          "text-center": center,
        })}
      >
        <h2 className="text-3xl xl:text-4xl font-extra-bold">{t("title")}</h2>
        <p className="text-base xl:text-lg">{t("subTitle")}</p>
      </div>
      <Collapse
        className={contentClass}
        items={items.filter(
          (i) => !isPublic || (isPublic && i?.public === "true"),
        )}
        bordered={false}
        activeKey={activeKey}
        expandIcon={({ isActive }) =>
          isActive ? <MinusCircleIcon /> : <PlusCircleIcon />
        }
        expandIconPosition="end"
        onChange={(key) => setActiveKey(key)}
        ghost
      />
    </div>
  );
};

export default FAQCollapsible;
