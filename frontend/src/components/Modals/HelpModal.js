import { Modal } from "antd";

const HelpModal = ({ open, setOpen }) => {
  return (
    <Modal
      open={open}
      onOk={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      maskClosable={false}
    />
  );
};

export default HelpModal;
