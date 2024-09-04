"use client";
import { useState } from "react";
import { Button, Checkbox, Form, Input, Modal, Select } from "antd";
import { useTranslations } from "next-intl";
import { Envelope, Eye, EyeSlash, UserCircle } from "@/components/Icons";
import { GENDER, PURPOSE_OF_ACCOUNT } from "@/static/config";

import countryOptions from "../../../i18n/countries.json";
import { useRouter } from "@/routing";
import SubmitButton from "../SubmitButton";

const InputPassword = (props) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? "text" : "password"}
      addonBefore={
        <Button type="link" onClick={() => setVisible(!visible)}>
          {visible ? <Eye /> : <EyeSlash />}
        </Button>
      }
      {...props}
    />
  );
};

const { useForm } = Form;

const RegisterForm = () => {
  const [checkedList, setCheckedList] = useState([]);
  const [openTerms, setOpenTerms] = useState(false);
  const [openPasswordCheck, setOpenPasswordCheck] = useState(false);
  const router = useRouter();
  const [form] = useForm();

  const t = useTranslations("Register");
  const tc = useTranslations("common");
  const genderOptions = Object.keys(GENDER).map((k) => ({
    label: tc(k),
    value: GENDER?.[k],
  }));
  const purposeOptions = Object.keys(PURPOSE_OF_ACCOUNT).map((k) => ({
    label: tc(k),
    value: PURPOSE_OF_ACCOUNT?.[k],
  }));

  const checkBoxOptions = [
    { name: tc("passwordRule1"), re: /[a-z]/ },
    { name: tc("passwordRule2"), re: /\d/ },
    { name: tc("passwordRule4"), re: /[A-Z]/ },
    { name: tc("passwordRule5"), re: /^\S*$/ },
    { name: tc("passwordRule6"), re: /(?=.{8,})/ },
  ];

  const onChangePassword = ({ target }) => {
    const criteria = checkBoxOptions
      .map((x) => {
        const available = x.re.test(target.value);
        return available ? x.name : false;
      })
      .filter((x) => x);
    setCheckedList(criteria);
  };

  const onFinish = (values) => {
    console.info("values", values);
    router.push("/login");
  };

  return (
    <Form name="register" form={form} onFinish={onFinish}>
      <Form.Item
        name="fullname"
        rules={[
          {
            required: true,
            message: tc("fullNameRequired"),
          },
        ]}
      >
        <Input
          placeholder={t("fullName")}
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
          placeholder={t("gender")}
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
          placeholder={t("country")}
          options={countryOptions}
          fieldNames={{ label: "name", value: "alpha-2" }}
          optionFilterProp="name"
          variant="borderless"
          showSearch
          allowClear
        />
      </Form.Item>
      <Form.Item
        name="purpose_account"
        rules={[
          {
            required: true,
            message: tc("purposeAccountRequired"),
          },
        ]}
      >
        <Select
          placeholder={t("purposeAccount")}
          options={purposeOptions}
          variant="borderless"
        />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            type: "email",
            message: tc("emailRequired"),
          },
        ]}
      >
        <Input
          placeholder={t("email")}
          type="email"
          prefix={<Envelope />}
          variant="borderless"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
          },
          () => ({
            validator() {
              if (checkedList.length === checkBoxOptions.length) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(tc("passwordCriteriaError")));
            },
          }),
        ]}
        hasFeedback
      >
        <InputPassword
          placeholder={t("password")}
          onChange={onChangePassword}
          variant="borderless"
        />
      </Form.Item>
      <div className="w-full flex items-center justify-end mt-[-12px] mb-2">
        <button
          type="button"
          onClick={() => setOpenPasswordCheck(true)}
          className="text-sm italic text-dark-3"
        >
          {tc("passwordStrength", {
            progress: `${checkedList.length}/${checkBoxOptions.length}`,
          })}
        </button>
      </div>
      <Modal
        title={tc("passwordStrength", {
          progress: `${checkedList.length}/${checkBoxOptions.length}`,
        })}
        open={openPasswordCheck}
        onOk={() => setOpenPasswordCheck(false)}
        onCancel={() => setOpenPasswordCheck(false)}
        closable
      >
        <Checkbox.Group
          options={checkBoxOptions.map((x) => x.name)}
          value={checkedList}
        />
      </Modal>
      <Form.Item
        name="confirm_password"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: tc("confirmPasswordRequired"),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(tc("passwordMatchError")));
            },
          }),
        ]}
      >
        <InputPassword
          placeholder={t("confirmPassword")}
          variant="borderless"
          disabled={checkBoxOptions.length != checkedList.length}
        />
      </Form.Item>
      <Form.Item
        name="agreement"
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
        <Checkbox>
          <span>{t("checkboxAgreement")}</span>
          <button
            type="button"
            className="text-blue underline font-bold ml-1"
            onClick={() => setOpenTerms(true)}
          >
            {t("checkboxAgreementLink")}
          </button>
        </Checkbox>
      </Form.Item>
      <Modal
        title={t("checkboxAgreementLink")}
        open={openTerms}
        onOk={() => setOpenTerms(false)}
        onCancel={() => setOpenTerms(false)}
        closable
      />
      <SubmitButton form={form} block>
        {t("btnCreateAccount")}
      </SubmitButton>
    </Form>
  );
};

export default RegisterForm;
