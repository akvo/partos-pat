"use client";

import { Card, Flex, List, Tabs, Typography } from "antd";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { FolderIcon } from "./Icons";
import activeSessions from "@/static/json/active-sessions.json";

const { Title, Text } = Typography;

const ActiveSessionList = ({ data = [] }) => {
  const [activeKey, setActiveKey] = useState("facilitating");
  const [dataSource, setDataSource] = useState(data);
  const [loading, setLoading] = useState(false);
  const [needChanges, setNeedChanges] = useState(false);

  const t = useTranslations("Dashboard");

  const handleOnChange = (tabKey) => {
    setNeedChanges(true);
    setActiveKey(tabKey);
  };

  const loadDataSource = useCallback(() => {
    if (needChanges) {
      setLoading(true);
      setNeedChanges(false);
      setTimeout(() => {
        const _dataSource = activeSessions.filter(
          (a) =>
            (activeKey === "facilitating" && a?.user_id === 1) ||
            (activeKey === "viewing" && a?.user_id === 2)
        );
        setDataSource(_dataSource);
        setLoading(false);
      }, 500);
    }
  }, [needChanges, activeKey]);

  useEffect(() => {
    loadDataSource();
  }, [loadDataSource]);

  return (
    <>
      <Tabs
        activeKey={activeKey}
        onChange={handleOnChange}
        items={[
          {
            key: "facilitating",
            label: t("facilitatingTab"),
          },
          {
            key: "viewing",
            label: t("viewingTab"),
          },
        ]}
      />
      <List
        dataSource={dataSource}
        loading={loading}
        renderItem={(item) => (
          <div className="bg-green-active shadow-md cursor-pointer">
            <Card className="inherit" bordered={false}>
              <Flex justify="space-between" align="center">
                <div>
                  <FolderIcon />
                  <Title level={3}>{item?.session_name}</Title>
                  <Text>{item?.context}</Text>
                </div>
                <Flex
                  justify="space-between"
                  className="w-36 min-h-16 text-right"
                  vertical
                >
                  <p className="uppercase text-green-bold font-bold">
                    {t("active")}
                  </p>
                  <p className="uppercase font-xs">
                    {`${t("participantsCount")} `}
                    <strong className="font-bold">
                      {item?.participants_count}
                    </strong>
                  </p>
                </Flex>
              </Flex>
            </Card>
          </div>
        )}
      />
    </>
  );
};

export default ActiveSessionList;
