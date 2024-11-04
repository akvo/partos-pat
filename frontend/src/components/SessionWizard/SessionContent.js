import { forwardRef } from "react";
import StepOne from "./Step1";
import StepTwo from "./Step2";
import StepThree from "./Step3";
import StepFour from "./Step4";
import StepFive from "./Step5";
import StepSix from "./Step6";

const SessionContent = ({ accessible, step, patSession }, ref) => {
  switch (step) {
    case 1:
      return (
        <StepTwo
          {...{ patSession }}
          ref={ref}
          isEditable={patSession?.is_owner}
        />
      );
    case 2:
      return (
        <StepThree
          {...{ patSession }}
          ref={ref}
          isEditable={patSession?.is_owner}
        />
      );
    case 3:
      return (
        <StepFour
          {...{ patSession }}
          ref={ref}
          isEditable={patSession?.is_owner}
        />
      );
    case 4:
      return (
        <StepFive
          {...{ patSession }}
          ref={ref}
          isEditable={patSession?.is_owner}
        />
      );
    case 5:
      return <StepSix {...{ patSession }} ref={ref} />;

    default:
      return (
        <StepOne
          {...{ accessible, patSession }}
          ref={ref}
          isEditable={patSession?.is_owner}
        />
      );
  }
};

export default forwardRef(SessionContent);
