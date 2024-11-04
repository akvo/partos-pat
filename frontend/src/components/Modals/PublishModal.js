"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Modal,
  Space,
  Form,
  Checkbox,
  Input,
  Skeleton,
  Table,
} from "antd";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { api } from "@/lib";
import { FileArrowUpIcon, WarningIcon } from "../Icons";
import { useRouter } from "@/routing";

const { useForm } = Form;
const { TextArea } = Input;

const TableCell = ({
  dataIndex,
  record,
  children,
  className,
  index,
  ...restProps
}) => {
  const t = useTranslations("Session");
  if (typeof dataIndex === "number") {
    return (
      <td
        className={classNames("font-bold", {
          "bg-score-4": Object.values(children).includes(4),
          "bg-score-3": Object.values(children).includes(3),
          "bg-score-2": Object.values(children).includes(2),
          "bg-score-1": Object.values(children).includes(1),
          "bg-light-1": Object.values(children).includes(0),
        })}
        {...restProps}
      >
        {children}
      </td>
    );
  }
  return (
    <td
      className={classNames(className, {
        "td-yes": dataIndex === "agree",
      })}
      {...restProps}
    >
      {dataIndex === "name" && (
        <strong className="font-bold">{`${t("decision")} ${index + 1} : `}</strong>
      )}
      {dataIndex === "agree" ? t("yes") : children}
    </td>
  );
};

const PublishModal = ({ patSession, onPublish, readyToPublish = false }) => {
  const [preload, setPreload] = useState(true);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [decisions, setDecisions] = useState([]);

  const router = useRouter();
  const [form] = useForm();

  const t = useTranslations("Session");
  const tc = useTranslations("common");

  const columns = useMemo(() => {
    const orgs = patSession?.organizations?.map((o) => ({
      title: o?.acronym,
      dataIndex: o?.id,
      editable: false,
      key: o?.id,
      width: "80px",
    }));
    return [
      {
        dataIndex: "name",
        editable: false,
        key: "name",
        fixed: "left",
      },
      ...orgs,
      {
        title: t("agree"),
        dataIndex: "agree",
        editable: true,
        key: "agree",
        width: "80px",
      },
    ].map((col) => ({
      ...col,
      onCell: (record, index) => ({
        index,
        record,
        dataIndex: col.dataIndex,
      }),
    }));
  }, [patSession, t]);

  const dataSource = useMemo(() => {
    return decisions.map(({ scores, ...d }) => {
      const transformedScores = scores?.reduce((acc, curr) => {
        acc[curr.organization_id] = curr.score;
        acc[`id_${curr.organization_id}`] = curr.id;
        return acc;
      }, {});
      return {
        ...d,
        ...transformedScores,
      };
    });
  }, [decisions]);

  const onFinish = async (values) => {
    if (!readyToPublish) {
      return;
    }
    setPublishing(true);
    try {
      await api("PUT", `/sessions?id=${patSession.id}`, {
        session_name: values?.session_name || patSession?.session_name,
        context: values?.context || patSession?.context,
        is_published: true,
      });
      router.push("/dashboard");
      setPublishing(false);
    } catch (err) {
      console.error(err);
      setPublishing(false);
    }
  };

  const onClickPublish = async () => {
    try {
      if (onPublish) {
        await onPublish();
        setOpen(true);
      }
    } catch (err) {
      console.error(err);
      setOpen(false);
    }
  };

  const loadDecisions = useCallback(async () => {
    try {
      if (preload && patSession?.id) {
        setPreload(false);
        const resData = await api(
          "GET",
          `/decisions?session_id=${patSession.id}&desired=true`,
        );
        if (Array.isArray(resData)) {
          setDecisions(resData);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.err(err);
      setPreload(false);
      setLoading(false);
    }
  }, [patSession, preload]);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  return (
    <>
      <Button
        type="primary"
        onClick={onClickPublish}
        icon={<FileArrowUpIcon />}
        iconPosition="end"
        disabled={!readyToPublish}
        block
      >
        {t("publish")}
      </Button>
      <Modal
        open={open}
        onOk={() => {
          form.submit();
        }}
        okText={t("publish")}
        okButtonProps={{
          icon: <FileArrowUpIcon />,
          iconPosition: "end",
          loading: publishing,
          disabled: !readyToPublish,
        }}
        onCancel={() => setOpen(false)}
        cancelButtonProps={{
          ghost: true,
        }}
        maskClosable={false}
        width={1366}
        closable
      >
        <Form
          initialValues={{
            session_name: patSession?.session_name,
            context: patSession?.context,
          }}
          onFinish={onFinish}
          form={form}
          layout="vertical"
          className="text-base space-y-6"
        >
          <h1 className="font-bold text-xl mb-6">{t("publishPAT")}</h1>

          <div className="w-full border-b border-b-dark-2 space-y-2">
            <Form.Item label={t("title")} name="session_name">
              <Input />
            </Form.Item>
          </div>
          <Form.Item label={t("description")} name="context">
            <TextArea rows={4} />
          </Form.Item>
          <p>{t("participatingOrg")}</p>
          <div className="w-full flex flex-col lg:flex-row flex-wrap gap-6">
            {patSession?.organizations?.map((org) => {
              const [first, last] = org?.name ? org.name.split(/\s+/) : [""];
              return (
                <Space size="small" key={org.id}>
                  <Avatar>{`${first?.[0]}${last?.[0] || ""}`}</Avatar>
                  <p className="px-2 py-1 bg-[#F1F2F3E5]">{org.name}</p>
                </Space>
              );
            })}
          </div>
          <div className="border-dashed border-t border-dark-2" />

          <Skeleton loading={loading}>
            <Table
              components={{
                body: {
                  cell: TableCell,
                },
              }}
              rowKey="id"
              dataSource={dataSource}
              columns={columns}
              rowClassName="pat-publish-row"
              pagination={false}
            />
          </Skeleton>
          <div className="border-dashed border-t border-dark-2" />

          <Alert
            message={t("publishAlert")}
            type="error"
            icon={<WarningIcon />}
            showIcon
          />
          <div className="border-dashed border-t border-dark-2" />
          <Form.Item
            name="understood"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error(tc("checkAgreementRequired"))),
              },
            ]}
          >
            <Checkbox>{t("publishCheckbox")}</Checkbox>
          </Form.Item>

          <div className="w-full pb-8">
            <div className="border-dashed border-t border-dark-2" />
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default PublishModal;
