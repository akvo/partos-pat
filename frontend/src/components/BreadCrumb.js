"use client";

import { Link, usePathname } from "@/routing";
import { useTranslations } from "next-intl";
import HorizontalDivider from "./HorizontalDivider";
import { DASHBOARD_MENU } from "@/static/config";

const BreadCrumb = () => {
  const t = useTranslations("Dashboard");
  const pathName = usePathname();

  const activePage = DASHBOARD_MENU.find((d) => d?.url === pathName);
  return (
    <>
      <HorizontalDivider>
        <div className="pr-3">
          <Link href="/dashboard">{t("dashboard")}</Link>
        </div>
        <div className="px-3">
          <strong className="font-bold">{t(activePage?.name)}</strong>
        </div>
      </HorizontalDivider>
      <h1 className="font-bold text-xl">{t(activePage?.name)}</h1>
    </>
  );
};

export default BreadCrumb;
