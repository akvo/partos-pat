"use client";

import { Button } from "antd";
import { useState } from "react";
import { QuestionMarkIcon } from "../Icons";
import { HelpModal } from "../Modals";
import { useSessionContext } from "@/context/SessionContextProvider";

const HelpButton = () => {
  const [open, setOpen] = useState(false);
  const { step } = useSessionContext();

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
      <HelpModal {...{ open, setOpen }} step={step + 1} />
    </>
  );
};

export default HelpButton;
