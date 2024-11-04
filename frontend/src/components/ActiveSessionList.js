"use client";

import { useState } from "react";
import { Card, Dropdown, Flex, List, Spin } from "antd";
import { useTranslations } from "next-intl";
import {
  DotsTreeVerticalIcon,
  Eye,
  FolderIcon,
  FolderLockIcon,
  PencilEditIcon,
  TrashIcon,
} from "./Icons";
import { useRouter } from "@/routing";
import { useUserContext } from "@/context/UserContextProvider";
import { api } from "@/lib";
import { DeleteSessionModal, EditSessionModal } from "./Modals";
import moment from "moment";
import { useSessionDispatch } from "@/context/SessionContextProvider";
import dayjs from "dayjs";

const ActiveSessionList = ({ data = [] }) => {
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDatasource] = useState(data);
  const [patDelete, setPATDelete] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

  const t = useTranslations("Dashboard");
  const router = useRouter();
  const userContext = useUserContext();
  const sessionDispatch = useSessionDispatch();

  const onEdit = async (item) => {
    setLoading(true);
    try {
      const patSession = await api("GET", `/sessions?id=${item.id}`);
      if (patSession?.id) {
        const organizations = await api(
          "GET",
          `/session/${item.id}/organizations`
        );
        setEdit({
          ...item,
          ...patSession,
          organizations,
          date: dayjs(patSession?.date),
        });
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const onDelete = async (item) => {
    try {
      const patSession = await api("GET", `/sessions?id=${item.id}`);
      if (patSession?.id) {
        setPATDelete({
          ...item,
          ...patSession,
        });
        setOpenDelete(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onDeleteSession = (id) => {
    setPATDelete(null);
    const updatedDataSource = dataSource.filter((d) => d?.id !== id);
    setDatasource(updatedDataSource);
    sessionDispatch({
      type: "TOTAL_ACTIVE_UPDATE",
      payload: updatedDataSource?.length,
    });
  };

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
        dataSource={dataSource}
        renderItem={(item) => (
          <List.Item>
            <Card
              className="w-full min-w-60 min-h-36 max-h-48"
              bordered={false}
              hoverable
            >
              <Flex justify="space-between" align="start" className="mb-3">
                <span>
                  {item?.facilitator?.id === userContext?.id ? (
                    <FolderIcon />
                  ) : (
                    <FolderLockIcon />
                  )}
                </span>
                <span>
                  <Dropdown
                    trigger={["click"]}
                    placement="bottom"
                    menu={{
                      items: item?.is_owner
                        ? [
                            {
                              label: (
                                <div className="w-full flex flex-row items-center justify-end gap-2 font-bold">
                                  <span className="w-10/12 text-right">
                                    {t("details")}
                                  </span>
                                  <Eye />
                                </div>
                              ),
                              key: "view",
                              onClick: () => {
                                router.push(`/dashboard?session=${item.id}`);
                              },
                            },
                            {
                              label: (
                                <div className="w-full flex flex-row items-center justify-end gap-2 font-bold">
                                  <span className="w-10/12 text-right">
                                    {t("edit")}
                                  </span>
                                  {loading ? <Spin /> : <PencilEditIcon />}
                                </div>
                              ),
                              key: "edit",
                              onClick: () => {
                                onEdit(item);
                              },
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
                                onDelete(item);
                              },
                            },
                          ]
                        : [
                            {
                              label: (
                                <div className="w-full flex flex-row items-center justify-end gap-2 font-bold">
                                  <span className="w-10/12 text-right">
                                    {t("details")}
                                  </span>
                                  <Eye />
                                </div>
                              ),
                              key: "view",
                              onClick: () => {
                                router.push(`/dashboard?session=${item.id}`);
                              },
                            },
                          ],
                    }}
                  >
                    <a role="button" className="text-dark-10">
                      <DotsTreeVerticalIcon />
                    </a>
                  </Dropdown>
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
      <EditSessionModal
        open={edit ? true : false}
        setClose={(patSession = {}) => {
          setEdit(null);
          if (patSession?.id) {
            setDatasource(
              dataSource.map((d) =>
                d?.id === patSession?.id ? { ...d, ...patSession } : d
              )
            );
          }
        }}
        initialValues={edit || {}}
      />
      <DeleteSessionModal
        open={openDelete}
        setOpen={setOpenDelete}
        patSession={patDelete}
        onDeleteSession={onDeleteSession}
      />
    </div>
  );
};

export default ActiveSessionList;
