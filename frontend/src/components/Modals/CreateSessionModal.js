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
  message,
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
import { api } from "@/lib";
import { redirect, useRouter } from "@/routing";
import countryOptions from "../../../i18n/countries.json";
import { SECTOR } from "@/static/config";
// import { redirect } from "next/navigation";

const { useForm } = Form;
const { TextArea } = Input;

const CreateSessionModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateSession, setDateSession] = useState(null);
  const [form] = useForm();
  const router = useRouter();

  const t = useTranslations("CreateSession");
  const td = useTranslations("Dashboard");
  const t_error = useTranslations("Error");

  const onFinish = async (payload) => {
    setLoading(true);
    try {
      const { id: dataID, details } = await api("POST", "/sessions", {
        ...payload,
        date: dateSession,
      });
      if (dataID) {
        setOpen(false);
        router.replace(`/dashboard?session=${dataID}`);
      }

      if (details) {
        details.forEach((err) => {
          message.error(err);
        });
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

  return (
    <>
      <Button onClick={() => setOpen(true)} type="primary">
        {td("newPATSession")} <FolderSimplePlus />
      </Button>
      <Modal
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        okText={t("save")}
        okButtonProps={{
          icon: <SaveIcon />,
          iconPosition: "end",
          onClick: () => {
            form.submit();
          },
          loading,
        }}
        cancelText={t("cancel")}
        cancelButtonProps={{
          ghost: true,
        }}
        closable
        width={1366}
      >
        <h2 className="text-xl font-bold mb-8">{t("title")}</h2>
        <Form
          name="create-session"
          layout="vertical"
          form={form}
          onFinish={onFinish}
          className="space-y-4"
          initialValues={{
            session_name: "Example session #1",
            countries: ["ID", "NL"],
            sector: 2,
            date: null,
            organizations: [
              { name: "Akvo Foundation", acronym: "Akvo" },
              { name: "Partos Global Org", acronym: "PARTOS" },
            ],
            context:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse interdum consequat laoreet. Donec sollicitudin venenatis ex at tempor. ",
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
                    message: t_error("required", { field_title: t("name") }),
                  },
                ]}
              >
                <Input placeholder={t("name")} variant="borderless" />
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
                      message: t_error("required", { field_title: "Date" }),
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
          <Form.Item
            label={<h3 className="text-md font-bold">{t("orgSection")}</h3>}
          >
            <Form.List name={"organizations"}>
              {(fields, option) => (
                <Flex gap={16} vertical>
                  {fields.map((field) => (
                    <Flex className="w-full" key={field.key} gap="middle">
                      <Form.Item
                        noStyle
                        name={[field.name, "name"]}
                        className="w-full md:w-1/2"
                      >
                        <Input
                          placeholder={t("orgName")}
                          variant="borderless"
                        />
                      </Form.Item>
                      <Form.Item
                        noStyle
                        name={[field.name, "acronym"]}
                        className="w-full md:w-1/2"
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
                          option.remove(field.name);
                        }}
                      />
                    </Flex>
                  ))}
                  <div className="w-64">
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
        </Form>
      </Modal>
    </>
  );
};

export default CreateSessionModal;
