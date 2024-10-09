import { forwardRef } from "react";

import StepOne from "../SessionWizard/Step1";
import StepTwo from "../SessionWizard/Step2";
import StepThree from "../SessionWizard/Step3";
import StepFour from "../SessionWizard/Step4";
import StepFive from "../SessionWizard/Step5";
import StepSix from "./Step6";

const SessionContent = ({ step, patSession }, ref) => {
  switch (step) {
    case 1:
      return <StepTwo {...{ patSession }} ref={ref} />;
    case 2:
      return <StepThree {...{ patSession }} ref={ref} />;
    case 3:
      return <StepFour {...{ patSession }} ref={ref} />;
    case 4:
      return <StepFive {...{ patSession }} ref={ref} />;
    case 5:
      return <StepSix {...{ patSession }} ref={ref} />;

    default:
      return <StepOne {...{ patSession }} ref={ref} />;
  }
};

export default forwardRef(SessionContent);
