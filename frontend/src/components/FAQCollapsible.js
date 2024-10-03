"use client";

import { useTranslations } from "next-intl";
import { Collapse, Image } from "antd";
import { MinusCircleIcon, PlusCircleIcon } from "./Icons";
import classNames from "classnames";

const FAQCollapsible = ({
  wrapClass = "w-full flex flex-col items-center justify-center",
  contentClass = "w-full lg:w-8/12",
  center = true,
}) => {
  const t = useTranslations("FAQ");

  const items = [
    {
      key: "1",
      label: t("question1"),
      children: <p>{t("answer1")}</p>,
    },
    {
      key: "2",
      label: t("question2"),
      children: <p>{t("answer2")}</p>,
    },
    {
      key: "3",
      label: t("question3"),
      children: <p>{t("answer3")}</p>,
    },
    {
      key: "4",
      label: t("question4"),
      children: (
        <>
          <p>{t("answer4")}</p>
          <ul className="list-disc ml-8">
            <li>{t("answer4a")}</li>
            <li>{t("answer4b")}</li>
          </ul>
        </>
      ),
    },
    {
      key: "5",
      label: t("question5"),
      children: <p>{t("answer5")}</p>,
    },
    {
      key: "6",
      label: t("question6"),
      children: <p>{t("answer6")}</p>,
    },
    {
      key: "7",
      label: t("question7"),
      children: <p>{t("answer7")}</p>,
    },
    {
      key: "8",
      label: t("question8"),
      children: (
        <div className="space-y-6">
          <p>{t("answer8")}</p>
          <div className="w-full md:w-10/12 lg:w-8/12 2xl:w-1/2">
            <Image
              src="/images/faq-question-8.png"
              width={"100%"}
              alt={t("question8")}
            />
          </div>
        </div>
      ),
    },
    {
      key: "9",
      label: t("question9"),
      children: (
        <div className="space-y-2">
          <p>{t("answer9")}</p>
          <ul className="list-disc ml-8">
            <li>{t("answer9a")}</li>
            <li>{t("answer9b")}</li>
            <li>{t("answer9c")}</li>
          </ul>
          <p>{t("answer9End")}</p>
        </div>
      ),
    },
  ];

  return (
    <div className={wrapClass}>
      <div
        className={classNames("w-full text-dark-10 space-y-5 mb-16", {
          "text-center": center,
        })}
      >
        <h2 className="text-4xl font-extra-bold">{t("title")}</h2>
        <p className="text-lg">{t("subTitle")}</p>
      </div>
      <Collapse
        className={contentClass}
        items={items}
        bordered={false}
        defaultActiveKey={["1"]}
        expandIcon={({ isActive }) =>
          isActive ? <MinusCircleIcon /> : <PlusCircleIcon />
        }
        expandIconPosition="end"
        ghost
      />
    </div>
  );
};

export default FAQCollapsible;
