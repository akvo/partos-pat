"use client";

import { Button, Flex, Modal } from "antd";
import { useTranslations } from "next-intl";
import { DASHBOARD_MENU } from "@/static/config";
import { useRouter } from "@/routing";
import { LifebuoyIcon } from "./Icons";
import { useState } from "react";
import classNames from "classnames";
import { HelpModal } from "./Modals";

const DashboardMenu = () => {
  const [activeKey, setActiveKey] = useState(1);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const t = useTranslations("Dashboard");

  const handleOnClick = ({ id, url }) => {
    setActiveKey(id);
    router.push(url);
  };

  return (
    <Flex justify="space-between" className="w-full h-auto lg:h-full" vertical>
      <ul>
        {DASHBOARD_MENU.map((m) => (
          <li
            className={classNames("font-bold hover:bg-primary-hover", {
              "bg-primary-menu": activeKey === m.id,
            })}
            key={m.id}
          >
            <Button type="text" onClick={() => handleOnClick(m)} icon={m.icon}>
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
