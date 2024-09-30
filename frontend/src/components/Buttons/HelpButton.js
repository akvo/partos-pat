"use client";

import { Button } from "antd";
import { useState } from "react";
import { QuestionMarkIcon } from "../Icons";
import { HelpModal } from "../Modals";

const HelpButton = ({ step = 1 }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="link"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="border-2 border-dark-7 p-2 rounded-full text-dark-10">
          <QuestionMarkIcon size={24} />
        </div>
      </Button>
      <HelpModal {...{ open, setOpen, step }} />
    </>
  );
};

export default HelpButton;
