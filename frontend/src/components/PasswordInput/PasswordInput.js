"use client";

import { Form } from "antd";
import WithRules from "./WithRules";
import PasswordField from "./PasswordField";

const PasswordInput = ({
  name,
  dependencies = [],
  rules = [],
  hasFeedback = true,
  ...props
}) => {
  return (
    <Form.Item
      name={name}
      dependencies={dependencies}
      rules={rules}
      hasFeedback
    >
      <PasswordField variant="borderless" {...props} />
    </Form.Item>
  );
};

PasswordInput.WithRules = WithRules;

export default PasswordInput;
