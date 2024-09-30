import { forwardRef } from "react";
import StepOne from "./Step1";
import StepTwo from "./Step2";
import StepThree from "./Step3";
import StepFour from "./Step4";
import StepFive from "./Step5";
import StepSix from "./Step6";

const SessionContent = ({ goToNext, step, patSession }, ref) => {
  switch (step) {
    case 1:
      return <StepTwo />;
    case 2:
      return <StepThree />;
    case 3:
      return <StepFour />;
    case 4:
      return <StepFive />;
    case 5:
      return <StepSix />;

    default:
      return <StepOne {...{ goToNext, patSession }} ref={ref} />;
  }
};

export default forwardRef(SessionContent);
