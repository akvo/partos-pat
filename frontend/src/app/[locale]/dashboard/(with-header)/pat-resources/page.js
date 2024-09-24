import { useTranslations } from "next-intl";
import { Card } from "antd";

const ResourcesPage = () => {
  const t = useTranslations("Dashboard");
  return (
    <Card>
      <h1 className="font-bold text-xl">{t("resources")}</h1>
    </Card>
  );
};

export default ResourcesPage;
