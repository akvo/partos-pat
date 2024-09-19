"use client";

import { Card, Flex, List, Typography } from "antd";
import { useTranslations } from "next-intl";
import { FolderIcon } from "./Icons";

const { Title, Text } = Typography;

const ActiveSessionList = ({ data = [] }) => {
  const t = useTranslations("Dashboard");

  return (
    <div className="w-full h-auto">
      <h2 className="font-bold text-xl">{t("activeSessions")}</h2>
      <br />
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card className="w-full min-h-20" bordered={false}>
              <Flex justify="space-between" align="baseline">
                <FolderIcon />
                <p className="uppercase text-green-bold font-bold">
                  {t("details")}
                </p>
              </Flex>
              <Flex
                justify="space-between"
                className="w-full min-h-20"
                vertical
              >
                <div className="text-left">
                  <Title level={3}>{item?.session_name}</Title>
                  <Text>{item?.context}</Text>
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
