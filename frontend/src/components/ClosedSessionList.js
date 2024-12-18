"use client";

import {
  Button,
  Card,
  Flex,
  List,
  Typography,
  Dropdown,
  Form,
  Input,
  Select,
} from "antd";
import {
  DotsTreeVerticalIcon,
  DownloadSimpleIcon,
  TrashIcon,
  Eye,
} from "./Icons";
import { useTranslations } from "next-intl";
import { FILTER_BY_ROLE, PAT_SESSION } from "@/static/config";
import { useRouter } from "@/routing";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib";
import { DeleteSessionModal } from "./Modals";
import { useSessionDispatch } from "@/context/SessionContextProvider";
import classNames from "classnames";
import { PrintDocument } from "./PrintDocument";
import PrintPage from "./PrintDocument/PrintPage";

const { Title, Text } = Typography;
const { Search } = Input;

const ClosedSessionList = ({ data = [], totalClosed = 0 }) => {
  const [dataSource, setDataSource] = useState(data);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [totalData, setTotalData] = useState(totalClosed);
  const [loading, setLoading] = useState(false);
  const [patSession, setPatSession] = useState(null);
  const [preload, setPreload] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [comments, setComments] = useState([]);

  const sessionDispatch = useSessionDispatch();

  const [form] = Form.useForm();
  const printButtonRef = useRef(null);

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

  const onFinish = async ({ search, role }) => {
    setLoading(true);
    try {
      const queryParams = [];
      if (search) queryParams.push(`search=${search}`);
      if (role) queryParams.push(`role=${role}`);
      const { data: apiData, total } = await api(
        "GET",
        `/sessions?published=true&page=${1}&page_size=${PAT_SESSION.pageSize}&${queryParams.join("&")}`,
      );
      setDataSource(apiData);
      setTotalData(total);
      sessionDispatch({
        type: "FILTER_SUBMITTED",
      });
      sessionDispatch({
        type: "TOTAL_CLOSED_UPDATE",
        payload: total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteSession = (id) => {
    const updatedDataSource = dataSource.filter((item) => item.id !== id);
    setDataSource(updatedDataSource);
  };

  const onDownload = async (id) => {
    setLoading(true);
    try {
      const resPatSession = await api("GET", `/sessions/?id=${id}`);
      setPatSession(resPatSession);
      const resParticipants = await api("GET", `/session/${id}/participants`);
      const resDecisions = await api("GET", `/decisions/?session_id=${id}`);
      const { data: dataComments } = await api(
        "GET",
        `/session/${id}/comments?page_size=100`,
      );
      setParticipants(resParticipants);
      setDecisions(resDecisions);
      setComments(dataComments);
      printButtonRef.current.click();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onClickPrintButton = (onPrint) => {
    onPrint(`${PAT_SESSION.prefixFileName} ${patSession?.session_name}`);
    setLoading(false);
  };

  useEffect(() => {
    if (preload) {
      setPreload(false);
      sessionDispatch({
        type: "TOTAL_CLOSED_UPDATE",
        payload: totalData,
      });
    }
  }, [totalData, preload, sessionDispatch]);

  const t = useTranslations("Dashboard");
  const tc = useTranslations("common");
  const router = useRouter();

  return (
    <div className="w-full pt-2 xl:pt-4 space-y-2">
      <h2 className="font-bold text-xl">{t("closedSessions")}</h2>
      {totalClosed === 0 && <br />}
      <Form form={form} onFinish={onFinish}>
        <div
          className={classNames(
            "w-full flex flex-row gap-4 items-center justify-between",
            {
              hidden: totalClosed === 0,
            },
          )}
        >
          <div className="w-1/2 max-w-80">
            <Form.Item name="search">
              <Search
                placeholder={tc("search")}
                onSearch={(value) => {
                  form.setFieldValue("search", value);
                  form.submit();
                }}
                allowClear
              />
            </Form.Item>
          </div>
          <div className="w-56 2xl:w-80">
            <Form.Item name="role">
              <Select
                placeholder={t("filterByRole")}
                options={Object.keys(FILTER_BY_ROLE).map((role) => ({
                  label: t(role),
                  value: FILTER_BY_ROLE[role],
                }))}
                className="pat-filter-by-role"
                onChange={(value) => {
                  form.setFieldValue("role", value);
                  form.submit();
                }}
                allowClear
              />
            </Form.Item>
          </div>
        </div>
      </Form>
      <PrintDocument>
        <List
          pagination={
            totalData > PAT_SESSION.pageSize
              ? {
                  pageSize: PAT_SESSION.pageSize,
                  total: totalData,
                  onChange: onPaginationChange,
                  responsive: true,
                  align: "center",
                }
              : false
          }
          dataSource={dataSource}
          loading={loading}
          renderItem={(item) => (
            <div className="mb-3">
              <Card hoverable>
                <Flex align="center" justify="space-between">
                  <div
                    role="button"
                    onClick={() => {
                      router.push(`/dashboard/overview/${item?.id}`);
                    }}
                  >
                    <Title level={4}>{item?.session_name}</Title>
                    <Text className="line-clamp-1">{item?.context}</Text>
                  </div>
                  <div>
                    <Dropdown
                      trigger={["click"]}
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
                            onClick: () => {
                              onDownload(item?.id);
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
        <PrintDocument.Button
          ref={printButtonRef}
          onClick={onClickPrintButton}
          className="w-full absolute inset-x-1/2"
          type="link"
        />
        <PrintDocument.Area>
          <PrintPage {...{ patSession, participants, decisions, comments }} />
        </PrintDocument.Area>
      </PrintDocument>
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
