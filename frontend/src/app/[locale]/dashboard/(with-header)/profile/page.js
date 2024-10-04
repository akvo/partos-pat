"use client";

import { LogoutButton, ProfileAvatar } from "@/components";
import { SaveIcon, UserCircle } from "@/components/Icons";
import { useRouter } from "@/routing";
import { GENDER, PURPOSE_OF_ACCOUNT } from "@/static/config";
import { Button, Card, Form, Input, Select, Space } from "antd";
import { useTranslations } from "next-intl";
import countryOptions from "../../../../../../i18n/countries.json";
import { useUserContext } from "@/context/UserContextProvider";

const { useForm } = Form;

const ProfilePage = () => {
  const t = useTranslations("Dashboard");
  const t_register = useTranslations("Register");
  const tc = useTranslations("common");

  const userContext = useUserContext();
  const router = useRouter();
  const [form] = useForm();

  const genderOptions = Object.keys(GENDER).map((k) => ({
    label: tc(k),
    value: GENDER?.[k],
  }));

  const purposeOptions = Object.keys(PURPOSE_OF_ACCOUNT).map((k) => ({
    label: tc(k),
    value: PURPOSE_OF_ACCOUNT?.[k],
  }));

  const onFinish = (values) => {
    console.log("val", values);
  };

  return (
    <Card>
      <div className="w-full px-5 pt-3 pb-6 flex items-center justify-between border-b border-b-dark-2">
        <div>
          <ProfileAvatar large />
        </div>
        <div>
          <LogoutButton />
        </div>
      </div>
      <Form form={form} initialValues={userContext} onFinish={onFinish}>
        <div className="w-full flex flex-row justify-between px-5 py-6">
          <div className="w-full lg:w-5/12 space-y-4">
            <strong>{t("userProfileTitle")}</strong>
            <p>{t("userProfileSubtitle")}</p>
          </div>
          <div className="w-full lg:w-7/12">
            <Form.Item
              name="full_name"
              rules={[
                {
                  required: true,
                  message: tc("fullNameRequired"),
                },
              ]}
            >
              <Input
                placeholder={t_register("fullName")}
                prefix={<UserCircle />}
                variant="borderless"
              />
            </Form.Item>
            <Form.Item
              name="gender"
              rules={[
                {
                  required: true,
                  message: tc("genderRequired"),
                },
              ]}
            >
              <Select
                placeholder={t_register("gender")}
                options={genderOptions}
                variant="borderless"
              />
            </Form.Item>
            <Form.Item
              name="country"
              rules={[
                {
                  required: true,
                  message: tc("countryRequired"),
                },
              ]}
            >
              <Select
                placeholder={t_register("country")}
                options={countryOptions}
                fieldNames={{ label: "name", value: "alpha-2" }}
                optionFilterProp="name"
                variant="borderless"
                showSearch
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="account_purpose"
              rules={[
                {
                  required: true,
                  message: tc("purposeAccountRequired"),
                },
              ]}
            >
              <Select
                placeholder={t_register("purposeAccount")}
                options={purposeOptions}
                variant="borderless"
              />
            </Form.Item>
          </div>
        </div>
        <div className="w-full flex flex-row justify-end py-8 px-5 border-t border-t-dark-2">
          <Space>
            <Button
              onClick={() => {
                router.push("/dashboard");
              }}
              className="min-w-24"
              ghost
            >
              {t("cancel")}
            </Button>
            <Button
              type="primary"
              icon={<SaveIcon />}
              iconPosition="end"
              htmlType="submit"
              className="min-w-28"
            >
              {t("save")}
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
};

export default ProfilePage;
