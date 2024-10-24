import { Modal } from "antd";
import { useTranslations } from "next-intl";
import FAQCollapsible from "../FAQCollapsible";

const StepHelpText = ({ step }) => {
  const t = useTranslations("Session");
  switch (step) {
    case 1:
      return (
        <div className="w-full space-y-3">
          <div className="pb-2">
            <strong className="text-xl">{t("titleStep1")}</strong>
          </div>
          <p>{t("helpStep1Text1")}</p>
          <p>{t("helpStep1Text2")}</p>
          <p>{t("helpStep1Text3")}</p>
          <p>{t("helpStep1Text4")}</p>
          <ul className="list-disc ml-8">
            <li>{t("helpStep1a")}</li>
            <li>{t("helpStep1b")}</li>
            <li>{t("helpStep1c")}</li>
          </ul>
          <p>{t("helpStep1Text5")}</p>
          <p>{t("helpStep1TextEnd")}</p>
        </div>
      );
    case 2:
      return (
        <div className="w-full space-y-3">
          <div className="pb-2">
            <strong className="text-xl">{t("titleStep2")}</strong>
          </div>
          <p>{t("helpStep2Text1")}</p>
          <p>{t("helpStep2Text2")}</p>
        </div>
      );
    case 3:
      return (
        <div className="w-full space-y-3">
          <div className="pb-2">
            <strong className="text-xl">{t("titleStep3")}</strong>
          </div>
          <p>{t("helpStep3")}</p>
          <ul className="list-disc ml-8">
            <li>{t("helpStep3a")}</li>
            <li>{t("helpStep3b")}</li>
          </ul>
        </div>
      );
    case 4:
      return (
        <div className="w-full space-y-3">
          <div className="pb-2">
            <strong className="text-xl">{t("titleStep4")}</strong>
          </div>
          <p className="whitespace-pre-line">{t("helpStep4")}</p>
        </div>
      );
    case 5:
      return (
        <div className="w-full space-y-3">
          <div className="pb-2">
            <strong className="text-xl">{t("titleStep5")}</strong>
          </div>
          <p className="whitespace-pre-line">{t("helpStep5")}</p>
        </div>
      );
    default:
      return (
        <div className="pt-6">
          <FAQCollapsible contentClass="w-full md:w-10/12" />
        </div>
      );
  }
};

const HelpModal = ({ open, setOpen, step }) => {
  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      maskClosable={false}
      width={768}
      cancelButtonProps={{
        style: {
          display: "none",
        },
      }}
      okButtonProps={{
        style: {
          display: "none",
        },
      }}
    >
      <StepHelpText step={parseInt(step)} />
    </Modal>
  );
};

export default HelpModal;
