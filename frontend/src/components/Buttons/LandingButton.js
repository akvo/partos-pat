"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { Space } from "antd";
import { UserCircle } from "../Icons";
import LangButton from "./LangButton";

const LandingButton = ({ isLoggedIn = false }) => {
  const t = useTranslations("Landing");
  const t_dash = useTranslations("Dashboard");

  return (
    <div className="w-fit px-6 py-2.5 text-sm xl:text-base text-light-1 bg-[#1E1E1E99]">
      <Space size="middle">
        <Link href={isLoggedIn ? "/dashboard" : "/login"}>
          <Space>
            <UserCircle />
            <span className="font-bold">
              {isLoggedIn ? t_dash("dashboard") : t("login")}
            </span>
          </Space>
        </Link>

        <LangButton />
      </Space>
    </div>
  );
};

export default LandingButton;
