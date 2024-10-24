"use client";

import { Card, Flex, List } from "antd";
import { useTranslations } from "next-intl";
import { FolderIcon, FolderLockIcon } from "./Icons";
import { useRouter } from "@/routing";
import { useUserContext } from "@/context/UserContextProvider";

const ActiveSessionList = ({ data = [] }) => {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const userContext = useUserContext();

  return (
    <div className="w-full h-auto pt-2 xl:pt-4">
      <h2 className="font-bold text-xl">{t("activeSessions")}</h2>
      <br />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              className="w-full min-w-60 min-h-36 max-h-48"
              bordered={false}
              hoverable
            >
              <Flex justify="space-between" align="start" className="mb-3">
                {item?.facilitator?.id === userContext?.id ? (
                  <FolderIcon />
                ) : (
                  <FolderLockIcon />
                )}
                <span
                  className="uppercase text-green-bold text-[10px] xl:text-xs font-bold"
                  role="link"
                  onClick={() => {
                    router.push(`/dashboard?session=${item.id}`);
                  }}
                >
                  {t("details")}
                </span>
              </Flex>
              <Flex
                justify="space-between"
                className="w-full min-h-20"
                role="link"
                onClick={() => {
                  router.push(`/dashboard/sessions/${item.id}`);
                }}
                vertical
              >
                <div className="text-left space-y-2">
                  <h4 className="w-full xl:w-10/12 text-sm xl:text-base font-extra-bold">
                    {item?.session_name}
                  </h4>
                  <p className="line-clamp-3 xl:line-clamp-2 text-xs xl:text-sm">
                    {item?.context}
                  </p>
                </div>
              </Flex>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ActiveSessionList;
