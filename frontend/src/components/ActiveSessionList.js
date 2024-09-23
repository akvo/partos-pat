"use client";

import { Card, Flex, List, Typography } from "antd";
import { useTranslations } from "next-intl";
import { FolderIcon, FolderLockIcon } from "./Icons";
import { useRouter } from "@/routing";
import { useUserContext } from "@/context/UserContextProvider";

const { Title, Text } = Typography;

const ActiveSessionList = ({ data = [] }) => {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const userContext = useUserContext();

  return (
    <div className="w-full h-auto pt-2">
      <h2 className="font-bold text-xl">{t("activeSessions")}</h2>
      <br />
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              className="w-full min-h-40"
              bordered={false}
              onClick={() => {
                router.push(`/dashboard/sessions/${item.id}`);
              }}
              hoverable
            >
              <Flex justify="space-between" align="baseline">
                {item?.facilitator?.id === userContext?.id ? (
                  <FolderIcon />
                ) : (
                  <FolderLockIcon />
                )}
                <p className="uppercase text-green-bold text-xs font-bold">
                  {t("details")}
                </p>
              </Flex>
              <Flex
                justify="space-between"
                className="w-full min-h-20"
                vertical
              >
                <div className="text-left">
                  <Title level={4}>{item?.session_name}</Title>
                  <Text className="line-clamp-3">{item?.context}</Text>
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
