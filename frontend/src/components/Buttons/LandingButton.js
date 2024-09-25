"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/routing";
import { Dropdown, Space } from "antd";
import { GlobeIcon, UserCircle } from "../Icons";
import { PAT_LANGS } from "@/static/config";

const LandingButton = ({ isLoggedIn = false }) => {
  const router = useRouter();

  const locale = useLocale();

  const onClick = ({ key }) => {
    router.replace("/", { locale: key });
  };

  const t = useTranslations("Landing");
  const t_dash = useTranslations("Dashboard");

  const localeLabel = PAT_LANGS.find((l) => l.key === locale);

  return (
    <div className="w-fit px-6 py-2.5 text-light-1 bg-[#1E1E1E99]">
      <Space size="middle">
        <Link href={isLoggedIn ? "/dashboard" : "/login"}>
          <Space>
            <UserCircle />
            <span className="font-bold">
              {isLoggedIn ? t_dash("dashboard") : t("login")}
            </span>
          </Space>
        </Link>

        <Dropdown
          menu={{
            items: PAT_LANGS,
            onClick,
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <GlobeIcon />
              <span className="font-bold">{localeLabel?.label || "EN"}</span>
            </Space>
          </a>
        </Dropdown>
      </Space>
    </div>
  );
};

export default LandingButton;
