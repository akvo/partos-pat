"use client";

import { Button, Card, Flex, List, Typography, Dropdown } from "antd";
import {
  DotsTreeVerticalIcon,
  DownloadSimpleIcon,
  TrashIcon,
  Eye,
} from "./Icons";
import { useTranslations } from "next-intl";
import { PAT_SESSION } from "@/static/config";
import { useRouter } from "@/routing";
import { useState } from "react";
import { api } from "@/lib";
import { DeleteSessionModal } from "./Modals";

const { Title, Text } = Typography;

const ClosedSessionList = ({ data = [], totalClosed = 0 }) => {
  const [dataSource, setDataSource] = useState(data);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [totalData, setTotalData] = useState(totalClosed);
  const [loading, setLoading] = useState(false);
  const [patSession, setPatSession] = useState(null);

  const onPaginationChange = async (page) => {
    setLoading(true);
    try {
      const { data: apiData } = await api(
        "GET",
        `/sessions?published=true&page=${page}&page_size=${PAT_SESSION.pageSize}`,
      );
      setDataSource(apiData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const onDeleteSession = (id) => {
    const updatedDataSource = dataSource.filter((item) => item.id !== id);
    setDataSource(updatedDataSource);
  };

  const t = useTranslations("Dashboard");
  const router = useRouter();

  return (
    <div className="w-full pt-2">
      <h2 className="font-bold text-xl">{t("closedSessions")}</h2>
      <br />
      <List
        pagination={
          totalData > PAT_SESSION.pageSize
            ? {
                pageSize: PAT_SESSION.pageSize,
                total: totalData,
                onChange: onPaginationChange,
                responsive: true,
                align: "center",
                position: ["bottomCenter"],
              }
            : false
        }
        dataSource={dataSource}
        loading={loading}
        renderItem={(item) => (
          <div className="mb-3">
            <Card hoverable>
              <Flex align="center" justify="space-between">
                <div>
                  <Title level={4}>{item?.session_name}</Title>
                  <Text className="line-clamp-1">{item?.context}</Text>
                </div>
                <div>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          label: (
                            <div className="w-full flex flex-row items-center justify-end gap-2 font-bold">
                              <span className="w-10/12 text-right">
                                {t("view")}
                              </span>
                              <Eye />
                            </div>
                          ),
                          key: "view",
                          onClick: () => {
                            router.push(`/dashboard/overview/${item?.id}`);
                          },
                        },
                        {
                          label: (
                            <div className="w-full flex flex-row items-center justify-end gap-2 font-bold">
                              <span className="w-10/12 text-right">
                                {t("downloadReport")}
                              </span>
                              <DownloadSimpleIcon />
                            </div>
                          ),
                          key: "downloadReport",
                        },
                        {
                          label: (
                            <div className="w-full flex flex-row items-center justify-end gap-2 font-bold">
                              <span className="w-10/12 text-right">
                                {t("delete")}
                              </span>
                              <TrashIcon />
                            </div>
                          ),
                          key: "delete",
                          danger: true,
                          onClick: () => {
                            setPatSession(item);
                            setOpenDeleteModal(true);
                          },
                        },
                      ],
                    }}
                    placement="top"
                  >
                    <Button type="link">
                      <DotsTreeVerticalIcon />
                    </Button>
                  </Dropdown>
                </div>
              </Flex>
            </Card>
          </div>
        )}
      />
      <DeleteSessionModal
        {...{
          open: openDeleteModal,
          setOpen: setOpenDeleteModal,
          patSession,
          onDeleteSession,
        }}
      />
    </div>
  );
};

export default ClosedSessionList;
