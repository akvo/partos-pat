import { useState } from "react";
import { Button, Input } from "antd";
import { Eye, EyeSlash } from "../Icons";

const PasswordField = (props) => {
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

export default PasswordField;
