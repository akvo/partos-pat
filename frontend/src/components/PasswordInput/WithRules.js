"use client";
import React, { useState } from "react";
import { Checkbox, Form, Modal, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { WarningCicle } from "@/components/Icons";
import PasswordField from "./PasswordField";

const WithRules = ({ errors = [] }) => {
  const [checkedList, setCheckedList] = useState([]);
  const [openPasswordCheck, setOpenPasswordCheck] = useState(false);

  const tc = useTranslations("common");
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

  return (
    <React.Fragment>
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
        hasFeedback={false}
        help={
          <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between py-2">
            <div>
              {errors.map((err, ex) => (
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
        <PasswordField
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
    </React.Fragment>
  );
};

export default WithRules;
