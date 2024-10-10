"use client";

import { api } from "@/lib";
import {
  Table,
  Flex,
  Form,
  Input,
  Space,
  Tag,
  Button,
  Select,
  Modal,
} from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import classNames from "classnames";
import countries from "../../i18n/countries.json";
import {
  ArrowNavIcon,
  Envelope,
  PencilEditIcon,
  SaveIcon,
  TrashIcon,
} from "./Icons";
import { useUserContext } from "@/context/UserContextProvider";

const { Search } = Input;

const DataDetail = ({ record, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const t = useTranslations("ManageUsers");
  const t_dashboard = useTranslations("Dashboard");

  const onFinish = async ({ id, is_superuser }) => {
    setLoading(true);
    try {
      const apiData = await api("PUT", `/admin/user/${id}`, {
        is_superuser: is_superuser === 1,
      });
      onUpdate(apiData);
      onClose(id);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Form
      initialValues={{
        ...record,
        is_superuser: record?.is_superuser ? 1 : 2,
        country:
          countries?.find((c) => c?.["alpha-2"] === record?.country)?.name ||
          record?.country,
      }}
      onFinish={onFinish}
    >
      <Flex gap={8} align="center">
        <div className="w-full lg:w-3/12">
          <Form.Item name="id">
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="email">
            <Input
              type="email"
              placeholder={t("colEmail")}
              prefix={<Envelope />}
              variant="borderless"
              className="readonly"
              disabled
            />
          </Form.Item>
        </div>
        <div className="w-full lg:w-3/12 2xl:w-2/12 pt-4">
          <Form.Item name="country">
            <Input
              placeholder={t("colCountry")}
              variant="borderless"
              className="readonly"
              disabled
            />
          </Form.Item>
        </div>

        <div className="w-full lg:w-3/12 2xl:w-2/12 pt-4">
          <Form.Item name="is_superuser">
            <Select
              placeholder={t("colRole")}
              options={[
                {
                  value: 1,
                  label: t("roleAdminValue"),
                },
                {
                  value: 2,
                  label: t("roleUserValue"),
                },
              ]}
              variant="borderless"
              allowClear
            />
          </Form.Item>
        </div>

        <div className="w-full lg:w-3/12  2xl:w-5/12 text-right">
          <Space>
            <Button onClick={() => onClose(record.id)} className="simple">
              {t_dashboard("cancel")}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveIcon />}
              iconPosition="end"
              className="simple"
              loading={loading}
            >
              {t_dashboard("save")}
            </Button>
          </Space>
        </div>
      </Flex>
    </Form>
  );
};

const UsersTable = ({ initialData = [], total = 0, pageSize = 10 }) => {
  const [dataSource, setDataSource] = useState(initialData);
  const [totalData, setTotalData] = useState(total);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [modal, contextHolder] = Modal.useModal();

  const [form] = Form.useForm();

  const onClose = (key) => {
    const currentKeys = expandedRowKeys?.filter((e) => e !== key);
    setExpandedRowKeys(currentKeys);
  };

  const onUpdate = (data) => {
    setDataSource(dataSource.map((d) => (d?.id === data?.id ? data : d)));
  };

  const onFinishSearch = async ({ name }) => {
    setLoading(true);
    try {
      const apiURL = name ? `/admin/users?name=${name}` : "/admin/users";
      const { data: apiData, total: apiTotal } = await api("GET", apiURL);
      setTotalData(apiTotal);
      setDataSource(apiData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const paginationOnChange = async (page) => {
    try {
      const { data: apiData } = await api("GET", `/admin/users?page=${page}`);
      setDataSource(apiData);
    } catch (err) {
      console.error(err);
    }
  };

  const onDeleteUser = async (closeModal, record) => {
    setLoading(true);
    try {
      await api("DELETE", `/admin/user/${record?.id}`);
      setDataSource(dataSource.filter((d) => d?.id !== record?.id));
      setLoading(false);
      await closeModal();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const userContext = useUserContext();
  const t = useTranslations("ManageUsers");
  const tc = useTranslations("common");

  const columns = [
    {
      title: t("colName"),
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: t("colCountry"),
      dataIndex: "country",
      key: "country",
      render: (value) => {
        const fc = countries.find((c) => c?.["alpha-2"] === value);
        return fc?.name || value;
      },
    },
    {
      title: t("colEmail"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("colRole"),
      dataIndex: "is_superuser",
      key: "is_superuser",
      render: (value) =>
        value ? (
          <Tag className="admin">{t("roleAdminValue")}</Tag>
        ) : (
          <Tag className="user">{t("roleUserValue")}</Tag>
        ),
    },
    Table.EXPAND_COLUMN,
  ];

  return (
    <div className="w-full relative rounded-lg shadow-lg bg-light-1 pb-6">
      <Flex className="w-full p-6" justify="space-between" align="center">
        <Space>
          <strong className="text-lg font-bold">{t("accounts")}</strong>
          <span className="rounded-2xl px-3 py-2 bg-light-grey-5">
            {t("totalUsers", {
              total,
            })}
          </span>
        </Space>
        <Space>
          <Form form={form} onFinish={onFinishSearch}>
            <Form.Item name="name">
              <Search
                placeholder={tc("search")}
                onSearch={() => form.submit()}
                allowClear
              />
            </Form.Item>
          </Form>
        </Space>
      </Flex>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <DataDetail {...{ record, onClose, onUpdate }} />
          ),
          expandIcon: ({ expanded, onExpand, record }) => (
            <div
              className={classNames({
                hidden: expanded,
              })}
            >
              <Space>
                <Button
                  type="link"
                  onClick={() => {
                    modal.confirm({
                      title: (
                        <Space>
                          <strong>{`${t("deleteTitle")}: `}</strong>
                          <p>{record?.full_name}</p>
                        </Space>
                      ),
                      content: <p>{t("deleteMessage")}</p>,
                      onOk: (close) => onDeleteUser(close, record),
                    });
                  }}
                  disabled={userContext?.id === record?.id}
                >
                  <TrashIcon />
                </Button>
                <Button type="link" onClick={(e) => onExpand(record, e)}>
                  <PencilEditIcon />
                </Button>
              </Space>
            </div>
          ),
          onExpandedRowsChange: setExpandedRowKeys,
          expandedRowKeys,
        }}
        pagination={{
          pageSize,
          total: totalData,
          responsive: true,
          align: "center",
          position: ["bottomCenter"],
          onChange: paginationOnChange,
          itemRender: (_, type, originalElement) => {
            if (type === "prev") {
              return (
                <Button className="simple" icon={<ArrowNavIcon left />}>
                  {tc("previous")}
                </Button>
              );
            }
            if (type === "next") {
              return (
                <Button
                  className="simple"
                  icon={<ArrowNavIcon />}
                  iconPosition="end"
                >
                  {tc("next")}
                </Button>
              );
            }
            return originalElement;
          },
        }}
        loading={loading}
        className="manage-users-table"
      />
      {contextHolder}
    </div>
  );
};

export default UsersTable;
