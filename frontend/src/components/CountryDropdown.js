"use client";

import { useState } from "react";
import { Button, Divider, Form, Input, Select } from "antd";
import { useTranslations } from "next-intl";

import countryOptions from "../../i18n/countries.json";
import { DownOutlineIcon } from "./Icons";

const CountryDropdown = ({ form }) => {
  const [open, setOpen] = useState(false);
  const [isOther, setIsOther] = useState(false);

  const t = useTranslations("Register");
  const tc = useTranslations("common");

  return (
    <Form.Item
      name="country"
      rules={[
        {
          required: true,
          message: tc("countryRequired"),
        },
      ]}
    >
      {isOther ? (
        <Input
          placeholder={t("country")}
          suffix={
            <button
              type="button"
              className="pat-country-button"
              onClick={() => {
                setIsOther(false);
                setOpen(true);
              }}
            >
              <DownOutlineIcon />
            </button>
          }
          variant="borderless"
        />
      ) : (
        <Select
          placeholder={t("country")}
          options={countryOptions}
          fieldNames={{ label: "name", value: "alpha-2" }}
          optionFilterProp="name"
          variant="borderless"
          open={open}
          showSearch
          allowClear
          onClick={() => {
            setOpen(!open);
          }}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider
                style={{
                  padding: 0,
                  margin: 0,
                }}
              />
              <Button
                type="link"
                onClick={() => {
                  if (form) {
                    form.setFieldValue("country", "");
                  }
                  setOpen(false);
                  setIsOther(true);
                }}
              >
                {t("countryOtherOption")}
              </Button>
            </>
          )}
        />
      )}
    </Form.Item>
  );
};

export default CountryDropdown;
