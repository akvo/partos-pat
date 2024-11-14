"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Col, DatePicker, Flex, Form, Input, Row, Select } from "antd";
import { PAT_SESSION, SESSION_PURPOSE } from "@/static/config";
import ProfileAvatar from "../ProfileAvatar";
import { MinusCircleIcon, PlusCircleIcon } from "../Icons";
import countryOptions from "../../../i18n/countries.json";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { TextArea } = Input;

const PATSessionForm = ({
  form,
  onFinish,
  initialValues = {
    organizations: [
      { name: null, acronym: null },
      { name: null, acronym: null },
    ],
  },
  formErrors = [],
}) => {
  const [dateSession, setDateSession] = useState(initialValues?.date);
  const [preload, setPreload] = useState(true);

  const t = useTranslations("CreateSession");
  const t_error = useTranslations("Error");
  const t_common = useTranslations("common");

  const dateError = formErrors?.find((e) => e?.name === "date");
  const dateErrorForm = dateError
    ? { help: dateError?.errors?.join(""), validateStatus: "error" }
    : {};

  const purposeOptions = Object.keys(SESSION_PURPOSE).map((k) => ({
    label: t_common.rich(SESSION_PURPOSE[k], {
      b: (token) => <b>{token}</b>,
    }),
    value: k,
  }));

  const purposeValue = Form.useWatch((values) => values.purpose, form);

  useEffect(() => {
    if (preload) {
      setPreload(false);
      Object.keys(initialValues).forEach((field) => {
        form.setFieldValue(field, initialValues?.[field]);
      });
    }
  }, [preload, form, initialValues]);
  return (
    <Form
      name="create-session"
      layout="vertical"
      form={form}
      onFinish={(values) => {
        if (onFinish) {
          const purpose = isNaN(values?.purpose)
            ? Object.keys(SESSION_PURPOSE)?.find(
                (k) => SESSION_PURPOSE?.[k] === values?.purpose,
              )
            : values?.purpose;
          onFinish({
            ...values,
            purpose,
            date: dayjs(dateSession).format("YYYY-MM-DD"),
            organizations:
              values.organizations.length === 0 ? null : values.organizations,
          });
          form.resetFields();
        }
      }}
      initialValues={initialValues}
    >
      {(_, formInstance) => (
        <>
          <h3 className="text-md font-bold">{t("sessionSection")}</h3>
          <Row>
            <Col md={24} lg={12} xl={12}>
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
            <Col md={24} lg={6} xl={8}>
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
            </Col>
            <Col md={24} lg={6} xl={4}>
              <Form.Item
                name="date"
                rules={[
                  {
                    required: true,
                    message: t_error("required", {
                      field_title: t("date"),
                    }),
                  },
                ]}
                className="w-full"
                {...dateErrorForm}
              >
                <DatePicker
                  format={{
                    format: "YYYY-MM-DD",
                    type: "mask",
                  }}
                  variant="borderless"
                  className="w-full"
                  onChange={(_, dateString) => setDateSession(dateString)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="purpose"
            rules={[
              {
                required: true,
                message: t_error("required", {
                  field_title: t("purpose"),
                }),
              },
            ]}
            className="w-full"
          >
            <Select
              placeholder={t("purpose")}
              options={purposeOptions}
              variant="borderless"
            />
          </Form.Item>
          {["Other", "0"].includes(purposeValue) && (
            <Form.Item
              name="other_purpose"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder={t("otherPurpose")} variant="borderless" />
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
                          {
                            max: PAT_SESSION.maxAcronym,
                            message: t_error("maxChar", {
                              field_title: t("orgAcronym"),
                              number: PAT_SESSION.maxAcronym,
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
                      disabled={
                        formInstance.getFieldValue("organizations").length + 1 >
                        PAT_SESSION.maxPartners
                      }
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
        </>
      )}
    </Form>
  );
};

export default PATSessionForm;
