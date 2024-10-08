"use client";

import { Button, Card, Flex, List, Typography } from "antd";
import { DotsTreeVerticalIcon } from "./Icons";
import { useTranslations } from "next-intl";
import { PAT_SESSION } from "@/static/config";
import { useRouter } from "@/routing";

const { Title, Text } = Typography;

const ClosedSessionList = ({ data = [], totalClosed = 0 }) => {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  return (
    <div className="w-full pt-2">
      <h2 className="font-bold text-xl">{t("closedSessions")}</h2>
      <br />
      <List
        pagination={
          totalClosed > PAT_SESSION.pageSize
            ? {
                pageSize: PAT_SESSION.pageSize,
              }
            : false
        }
        dataSource={data}
        renderItem={(item) => (
          <div className="mb-3">
            <Card
              onClick={() => {
                router.push(`/dashboard/overview/${item?.id}`);
              }}
              hoverable
            >
              <Flex align="center" justify="space-between">
                <div>
                  <Title level={4}>{item?.session_name}</Title>
                  <Text className="line-clamp-1">{item?.context}</Text>
                </div>
                <div>
                  <Button type="link">
                    <DotsTreeVerticalIcon />
                  </Button>
                </div>
              </Flex>
            </Card>
          </div>
        )}
      />
    </div>
  );
};

export default ClosedSessionList;
