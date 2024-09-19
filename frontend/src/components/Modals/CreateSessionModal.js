"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import {
  FolderSimplePlus,
  MinusCircleIcon,
  PlusCircleIcon,
  SaveIcon,
} from "../Icons";
import { api, errorsMapping } from "@/lib";
import countryOptions from "../../../i18n/countries.json";
import { SECTOR } from "@/static/config";
import ProfileAvatar from "../ProfileAvatar";

const { useForm } = Form;
const { TextArea } = Input;

const CreateSessionModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateSession, setDateSession] = useState(null);
  const [form] = useForm();

  const t = useTranslations("CreateSession");
  const td = useTranslations("Dashboard");
  const t_error = useTranslations("Error");

  const onFinish = async (payload) => {
    setLoading(true);
    try {
      const { id: dataID, details } = await api("POST", "/sessions", {
        ...payload,
        date: dateSession,
        organizations:
          payload.organizations.length === 0 ? null : payload.organizations,
      });
      if (dataID) {
        form.resetFields();
        setOpen(false);
        const url = new URL(window.location);
        window.location.href = `${url}?session=${dataID}`;
      }
      const _errors = errorsMapping(details);
      if (_errors.length) {
        form.setFields(_errors);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const sectorOptions = Object.keys(SECTOR).map((k) => ({
    label: SECTOR[k],
    value: k,
  }));

  const sectorValue = Form.useWatch((values) => values.sector, form);

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        {td("newPATSession")} <FolderSimplePlus />
      </Button>
      <Modal
        open={open}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          form.resetFields();
          setOpen(false);
        }}
        okText={t("save")}
        okButtonProps={{
          icon: <SaveIcon />,
          iconPosition: "end",
          loading,
        }}
        cancelText={t("cancel")}
        cancelButtonProps={{
          ghost: true,
        }}
        maskClosable={false}
        closable
        width={1366}
      >
        <h2 className="text-xl font-bold mb-8">{t("title")}</h2>
        <Form
          name="create-session"
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{
            organizations: [
              { name: null, acronym: null },
              { name: null, acronym: null },
            ],
          }}
        >
          <h3 className="text-md font-bold">{t("sessionSection")}</h3>
          <Row>
            <Col md={24} lg={10}>
              <Form.Item
                name="session_name"
                rules={[
                  {
                    required: true,
                    message: t_error("required", {
                      field_title: t("session_name"),
                    }),
                  },
                ]}
              >
                <Input placeholder={t("session_name")} variant="borderless" />
              </Form.Item>
            </Col>
            <Col md={24} lg={14}>
              <Flex className="w-full" align="baseline">
                <Form.Item
                  name="countries"
                  rules={[
                    {
                      required: true,
                      message: t_error("required", {
                        field_title: t("countries"),
                      }),
                    },
                  ]}
                  className="w-full lg:w-2/5"
                >
                  <Select
                    placeholder={t("countries")}
                    options={countryOptions}
                    fieldNames={{ label: "name", value: "alpha-2" }}
                    optionFilterProp="name"
                    variant="borderless"
                    mode="multiple"
                    showSearch
                    allowClear
                  />
                </Form.Item>

                <Form.Item
                  name="sector"
                  rules={[
                    {
                      required: true,
                      message: t_error("required", {
                        field_title: t("sector"),
                      }),
                    },
                  ]}
                  className="w-full lg:w-2/5"
                >
                  <Select
                    placeholder={t("sector")}
                    options={sectorOptions}
                    variant="borderless"
                  />
                </Form.Item>

                <Form.Item
                  name="date"
                  rules={[
                    {
                      required: true,
                      message: t_error("required", { field_title: t("date") }),
                    },
                  ]}
                  className="w-full lg:w-1/5"
                >
                  <DatePicker
                    format={{
                      format: "YYYY-MM-DD",
                      type: "mask",
                    }}
                    className="w-full"
                    variant="borderless"
                    onChange={(_, dateString) => setDateSession(dateString)}
                  />
                </Form.Item>
              </Flex>
            </Col>
          </Row>
          {sectorValue === "0" && (
            <Form.Item
              name="other_sector"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder={"Other sector"} variant="borderless" />
            </Form.Item>
          )}
          <Form.Item
            label={<h3 className="text-md font-bold">{t("orgSection")}</h3>}
          >
            <Form.List
              name={"organizations"}
              rules={[
                {
                  validator: async (_, orgs) => {
                    if (!orgs || orgs?.length < 2) {
                      return Promise.reject(new Error(t("orgMin2")));
                    }
                  },
                },
              ]}
            >
              {(fields, option, { errors }) => (
                <Flex gap={16} vertical>
                  {fields.map(({ key, name, ...restField }) => (
                    <Flex className="w-full" key={key} gap="middle">
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        className="w-full md:w-1/2"
                        rules={[
                          {
                            required: true,
                            message: t_error("required", {
                              field_title: t("orgName"),
                            }),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t("orgName")}
                          variant="borderless"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "acronym"]}
                        className="w-full md:w-1/2"
                        rules={[
                          {
                            required: true,
                            message: t_error("required", {
                              field_title: t("orgAcronym"),
                            }),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t("orgAcronym")}
                          variant="borderless"
                        />
                      </Form.Item>
                      <Button
                        type="link"
                        icon={<MinusCircleIcon />}
                        onClick={() => {
                          option.remove(name);
                        }}
                      />
                    </Flex>
                  ))}
                  <div className="py-1 mt-4 border-dashed border-t border-dark-2" />
                  <Form.ErrorList errors={errors} />
                  <div className="w-fit mb-4">
                    <Button
                      type="primary"
                      onClick={() => option.add()}
                      icon={<PlusCircleIcon />}
                      iconPosition="end"
                      size="small"
                      block
                      ghost
                    >
                      {t("addOrgButton")}
                    </Button>
                  </div>
                </Flex>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item
            name="context"
            rules={[
              {
                required: true,
                message: t_error("required", { field_title: t("context") }),
              },
            ]}
          >
            <TextArea rows={4} placeholder={t("context")} />
          </Form.Item>
          <div className="pt-3">
            <ProfileAvatar />
          </div>
        </Form>
        <div className="py-2 mt-8 border-dashed border-t border-dark-2" />
      </Modal>
    </>
  );
};

export default CreateSessionModal;
