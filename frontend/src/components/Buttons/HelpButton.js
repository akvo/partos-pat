"use client";

import { Button } from "antd";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { QuestionMarkIcon } from "../Icons";
import { HelpModal } from "../Modals";

const HelpButton = () => {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();

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
      <HelpModal {...{ open, setOpen }} step={params.get("step")} />
    </>
  );
};

export default HelpButton;
