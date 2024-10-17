"use client";

import { useLocale } from "next-intl";
import { Dropdown, Space } from "antd";
import { PAT_LANGS } from "@/static/config";
import { usePathname, useRouter } from "@/routing";
import { GlobeIcon } from "../Icons";
import classNames from "classnames";

const LangButton = ({ inherit = true, long = false, ...props }) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onClick = ({ key }) => {
    router.replace(pathname, { locale: key });
  };

  const localeLabel = PAT_LANGS.find((l) => l.key === locale);

  return (
    <Dropdown
      menu={{
        items: PAT_LANGS.map((l) => ({
          key: l.key,
          label: long ? l.long : l.label,
        })),
        onClick,
      }}
      {...props}
    >
      <a
        onClick={(e) => e.preventDefault()}
        className={classNames({
          "text-dark-10 hover:text-dark-7": !inherit,
        })}
      >
        <Space>
          <GlobeIcon />
          <span className="font-bold">
            {long ? localeLabel?.long : localeLabel?.label || "EN"}
          </span>
        </Space>
      </a>
    </Dropdown>
  );
};

export default LangButton;
