import { useTranslations } from "next-intl";
import { Card } from "antd";

const StatisticsPage = () => {
  const t = useTranslations("Dashboard");
  return (
    <Card>
      <h1 className="font-bold text-xl">{t("statistics")}</h1>
    </Card>
  );
};

export default StatisticsPage;
