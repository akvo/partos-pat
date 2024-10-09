"use client";

import { Button, Flex } from "antd";
import { useTranslations } from "next-intl";
import { DASHBOARD_MENU } from "@/static/config";
import { usePathname, useRouter } from "@/routing";
import { LifebuoyIcon } from "./Icons";
import { useState } from "react";
import classNames from "classnames";
import { HelpModal } from "./Modals";
import { useUserContext } from "@/context/UserContextProvider";

const DashboardMenu = () => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const userContext = useUserContext();

  const router = useRouter();
  const t = useTranslations("Dashboard");

  return (
    <Flex justify="space-between" className="w-full h-auto lg:h-full" vertical>
      <ul>
        {DASHBOARD_MENU.filter(
          (m) =>
            userContext?.is_superuser ||
            (!userContext?.is_superuser && !m?.isAdmin)
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
              {t(m.name)}
            </Button>
          </li>
        ))}
      </ul>
      <div className="w-full text-left">
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
        <HelpModal {...{ open, setOpen }} />
      </div>
    </Flex>
  );
};

export default DashboardMenu;
