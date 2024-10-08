"use client";

import { api } from "@/lib";
import { Table, Flex, Form, Input, Space, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import countries from "../../i18n/countries.json";

const { Search } = Input;

const UsersTable = ({ initialData = [], total = 0, pageSize = 10 }) => {
  const [dataSource, setDataSource] = useState(initialData);

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
          <Tag>{t("roleAdminValue")}</Tag>
        ) : (
          <Tag>{t("roleUserValue")}</Tag>
        ),
    },
  ];

  const paginationOnChange = async (page) => {
    try {
      const { data: apiData } = await api("GET", `/admin/users?page=${page}`);
      setDataSource(apiData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Flex className="w-full" justify="space-between" align="center">
        <Space>
          <strong>{t("accounts")}</strong>
          <span>
            {t("totalUsers", {
              total,
            })}
          </span>
        </Space>
        <Space>
          <Form>
            <Form.Item>
              <Search placeholder={tc("search")} />
            </Form.Item>
          </Form>
        </Space>
      </Flex>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => <p>{record.email}</p>,
          rowExpandable: (record) => record.id,
        }}
        dataSource={dataSource}
        pagination={{
          total,
          pageSize,
          responsive: true,
          align: "center",
          onChange: paginationOnChange,
        }}
      />
    </div>
  );
};

export default UsersTable;
