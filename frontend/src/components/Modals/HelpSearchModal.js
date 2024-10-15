"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Modal, Button, Form, Input } from "antd";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { CaretRight, LifebuoyIcon, WaveHandIcon } from "../Icons";
import { Link } from "@/routing";
import { inter, openSans } from "@/app/fonts";
import enLang from "../../../i18n/en.json";
import frLang from "../../../i18n/fr.json";

const { Search } = Input;

const HelpSearchModal = ({ full_name }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(null);
  const t = useTranslations("Dashboard");
  const t_modal = useTranslations("HelpModal");

  const params = useParams();

  const questionList = useMemo(() => {
    const trans = params?.locale === "en" ? enLang.FAQ : frLang.FAQ;
    return Object.keys(trans)
      ?.filter((k) => k?.includes("question"))
      ?.map((k, index) => ({
        id: index + 1,
        name: trans?.[k],
        answer: Object.keys(trans)
          ?.filter((k) => k?.includes(`answer${index + 1}`))
          ?.map((k) => trans?.[k])
          .join(" "),
      }))
      .filter((q) => {
        if (search || search?.trim()?.length > 0) {
          return (
            q?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
            q?.answer?.toLowerCase()?.includes(search?.toLowerCase())
          );
        }
        return true;
      });
  }, [params?.locale, search]);

  return (
    <>
      <Button
        type="link"
        onClick={() => {
          setOpen(true);
        }}
        icon={<LifebuoyIcon />}
        size="large"
      >
        {t("support")}
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        maskClosable={false}
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
        width={640}
        closable
      >
        <div className="w-full space-y-6 px-6 py-4">
          <div className={inter.className}>
            <h2 className="text-4xl font-[900]">
              <div className="flex flex-row items-center">
                <span className="text-[#7F7A79]">
                  {t_modal("greeting", {
                    fullname: full_name,
                  })}
                </span>
                <span>
                  <WaveHandIcon />
                </span>
              </div>
              <span className="text-4xl text-dark-7">{t_modal("title")}</span>
            </h2>
          </div>
          <div className="w-full border border-light-grey-9 rounded-lg px-4 py-8 space-y-6">
            <Form>
              <Form.Item name="search">
                <Search
                  placeholder={t_modal("searchPlaceholder")}
                  onSearch={(value) => {
                    setSearch(value);
                  }}
                  onClear={() => {
                    setSearch(null);
                  }}
                  allowClear
                />
              </Form.Item>
            </Form>
            <ul className={classNames("w-full space-y-4", openSans.className)}>
              {questionList?.map((question) => (
                <li key={question?.id}>
                  <Link
                    href={`/dashboard/faqs?question=${question?.id}`}
                    onClick={() => setOpen(false)}
                    className="w-full px-4 py-2 flex flex-row items-center justify-between text-base text-dark-10 hover:bg-light-grey-5 hover:text-dark-7"
                  >
                    <span className="w-full md:w-11/12">
                      <strong>{question?.name}</strong>
                    </span>
                    <span className="w-10 flex justify-end">
                      <CaretRight />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HelpSearchModal;
