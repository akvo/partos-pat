import { PAT_SESSION } from "@/static/config";
import { Modal } from "antd";
import { useTranslations } from "next-intl";

const HelpModal = ({ open, setOpen, step = 1 }) => {
  const t_session = useTranslations("Session");

  return (
    <Modal
      open={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      maskClosable={false}
      width={768}
      cancelButtonProps={{
        style: {
          display: "none",
        },
      }}
    >
      {parseInt(step) > 0 && parseInt(step) <= PAT_SESSION.totalSteps && (
        <div className="w-full space-y-4 whitespace-pre-line">
          <strong>{t_session(`titleStep${step}`)}</strong>
          <p>{t_session(`helpStep${step}`)}</p>
        </div>
      )}
    </Modal>
  );
};

export default HelpModal;
