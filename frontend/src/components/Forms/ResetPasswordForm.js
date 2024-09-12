"use client";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Modal,
  Select,
  Tooltip,
} from "antd";
import { useTranslations } from "next-intl";
import {
  Envelope,
  Eye,
  EyeSlash,
  UserCircle,
  WarningCicle,
} from "@/components/Icons";

import countryOptions from "../../../i18n/countries.json";
import { useRouter } from "@/routing";
import SubmitButton from "../Buttons/SubmitButton";

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

const ResetPasswordForm = ({ token }) => {
  const [checkedList, setCheckedList] = useState([]);
  const [openPasswordCheck, setOpenPasswordCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [form] = useForm();

  const t = useTranslations("Register");
  const tc = useTranslations("common");
  const tf = useTranslations("ForgotPassword");
  const t_err = useTranslations("Error");

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

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const req = await fetch(`/api/v1/users/reset-password?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (req.ok) {
        Modal.success({
          content: tf("successReset"),
          onOk: () => {
            router.push("/login");
          },
        });
        setSubmitting(false);
      } else {
        const { message: errorMessage } = await req.json();
        message.error(errorMessage);
        setSubmitting(false);
      }
    } catch {
      message.error(t_err("500"));
      setSubmitting(false);
    }
  };

  return (
    <Form name="register" form={form} onFinish={onFinish}>
      {(_, formInstance) => {
        return (
          <>
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
                    return Promise.reject(
                      new Error(tc("passwordCriteriaError")),
                    );
                  },
                }),
              ]}
              hasFeedback={false}
              help={
                <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between py-2">
                  <div>
                    {formInstance.getFieldError("password").map((err, ex) => (
                      <Tooltip
                        key={ex}
                        title={
                          <ul>
                            {checkBoxOptions.map((cb, cbx) => (
                              <li key={cbx}>
                                {checkedList.includes(cb.name) ? "✅" : "❌"}
                                {` ${cb.name}`}
                              </li>
                            ))}
                          </ul>
                        }
                      >
                        <span className="float-left">{err}</span>
                        <span className="float-left ml-1 py-1">
                          <WarningCicle size={14} />
                        </span>
                      </Tooltip>
                    ))}
                  </div>
                  <div>
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
                </div>
              }
            >
              <InputPassword
                placeholder={tc("password")}
                onChange={onChangePassword}
                variant="borderless"
                className="min-h-10"
              />
            </Form.Item>
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
            <SubmitButton form={form} loading={submitting} block>
              {tf("resetPassword")}
            </SubmitButton>
          </>
        );
      }}
    </Form>
  );
};

export default ResetPasswordForm;
