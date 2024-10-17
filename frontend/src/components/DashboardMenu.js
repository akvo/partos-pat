"use client";

import { Button, Flex } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { DASHBOARD_MENU } from "@/static/config";
import { usePathname, useRouter } from "@/routing";
import classNames from "classnames";
import { HelpSearchModal } from "./Modals";
import { useUserContext } from "@/context/UserContextProvider";

const DashboardMenu = () => {
  const pathName = usePathname();
  const userContext = useUserContext();
  const locale = useLocale();

  const router = useRouter();
  const t = useTranslations("Dashboard");

  return (
    <Flex justify="space-between" className="w-full h-auto lg:h-full" vertical>
      <ul>
        {DASHBOARD_MENU.filter(
          (m) =>
            userContext?.is_superuser ||
            (!userContext?.is_superuser && !m?.isAdmin),
        ).map((m) => (
          <li
            className={classNames("font-bold hover:bg-primary-hover", {
              "bg-primary-menu": pathName === m.url,
            })}
            key={m.id}
          >
            <Button
              type="text"
              onClick={() => {
                router.push(m.url);
              }}
              icon={m.icon}
            >
              {m.name === "faqs" && locale === "fr" ? "FAQ" : t(m.name)}
            </Button>
          </li>
        ))}
      </ul>
      <div className="w-full text-left">
        <HelpSearchModal full_name={userContext?.full_name} />
      </div>
    </Flex>
  );
};

export default DashboardMenu;
