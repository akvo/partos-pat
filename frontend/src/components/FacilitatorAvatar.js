import { Avatar, Space } from "antd";
import { useTranslations } from "next-intl";

const FacilitatorAvatar = ({ full_name = "" }) => {
  const [firstName, lastName] = full_name ? full_name.split(/\s/g) : [];

  const t = useTranslations("common");
  return (
    <Space size="small">
      <Avatar
        size={48}
      >{`${firstName ? firstName[0].toUpperCase() : ""}${lastName ? lastName?.[0]?.toUpperCase() : ""}`}</Avatar>
      <Space>
        <strong className="text-base font-bold">{`${t("facilitator")}: `}</strong>
        <p className="text-base">{full_name}</p>
      </Space>
    </Space>
  );
};

export default FacilitatorAvatar;
