"use client";

import { useTranslations } from "next-intl";
import { Collapse } from "antd";
import { MinusCircleIcon, PlusCircleIcon } from "./Icons";

const FAQCollapsible = ({
  wrapClass = "w-full flex flex-col items-center justify-center",
  contentClass = "w-full lg:w-8/12",
}) => {
  const t = useTranslations("Landing");
  const text = (
    <p>
      Yes, you can try us for free for 30 days. If you want, we’ll provide you
      with a free, personalized 30-minute onboarding call to get you up and
      running as soon as possible.
    </p>
  );
  const items = [
    {
      key: "1",
      label: "Sed pretium augue nunc, sit amet consectetur lectus ultrices ve.",
      children: text,
    },
    {
      key: "2",
      label: "Etiam posuere mi in risus interdum, ut luctus ante placerat.",
      children: text,
    },
    {
      key: "3",
      label: "Phasellus posuere purus est, eu consequat massa viverra maximus.",
      children: text,
    },
    {
      key: "4",
      label: "Nam venenatis semper sem, at ornare libero tempor sed. ",
      children: text,
    },
    {
      key: "5",
      label: "In diam erat, laoreet a sapien nec, vehicula dictum libero.",
      children: text,
    },
    {
      key: "6",
      label: "Donec tincidunt lectus non lectus hendrerit, ut fringilla.",
      children: text,
    },
  ];

  return (
    <div className={wrapClass}>
      <div className="w-full text-center text-dark-10 space-y-5 mb-16">
        <h2 className="text-4xl font-extra-bold">{t("faqTitle")}</h2>
        <p className="text-lg">{t("faqSubtitle")}</p>
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
