"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Col, DatePicker, Flex, Form, Input, Row, Select } from "antd";
import { PAT_SESSION, SECTOR } from "@/static/config";
import ProfileAvatar from "../ProfileAvatar";
import { MinusCircleIcon, PlusCircleIcon } from "../Icons";
import countryOptions from "../../../i18n/countries.json";
import moment from "moment";

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
}) => {
  const [dateSession, setDateSession] = useState(initialValues?.date);

  const t = useTranslations("CreateSession");
  const t_error = useTranslations("Error");

  const sectorOptions = Object.keys(SECTOR).map((k) => ({
    label: SECTOR[k],
    value: k,
  }));

  const sectorValue = Form.useWatch((values) => values.sector, form);

  useEffect(() => {
    if (initialValues?.sector && isNaN(form.getFieldValue("sector"))) {
      const initSector = sectorOptions?.find(
        (s) => s?.label === initialValues?.sector,
      );
      form.setFieldValue("sector", initSector?.value);
    }
  }, [sectorOptions, form, initialValues]);

  return (
    <Form
      name="create-session"
      layout="vertical"
      form={form}
      onFinish={(values) =>
        onFinish
          ? onFinish({
              ...values,
              date: moment(dateSession, "YYYY-MM-DD").format("YYYY-MM-DD"),
              organizations:
                values.organizations.length === 0 ? null : values.organizations,
            })
          : null
      }
      initialValues={initialValues}
    >
      {(_, formInstance) => (
        <>
          <h3 className="text-md font-bold">{t("sessionSection")}</h3>
          <Row>
            <Col md={24} lg={8} xl={10}>
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
            <Col md={24} lg={16} xl={14}>
              <Flex className="w-full" align="baseline" justify="space-between">
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
                  className="min-w-48 2xl:w-2/5"
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
                  className="w-full 2xl:w-2/5"
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
                      message: t_error("required", {
                        field_title: t("date"),
                      }),
                    },
                  ]}
                  className="w-64 2xl:w-1/5"
                >
                  <DatePicker
                    format={{
                      format: "YYYY-MM-DD",
                      type: "mask",
                    }}
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
