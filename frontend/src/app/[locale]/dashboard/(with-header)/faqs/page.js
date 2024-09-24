import { useTranslations } from "next-intl";
import { Card } from "antd";

const FAQPage = () => {
  const t = useTranslations("Dashboard");
  return (
    <Card>
      <h1 className="font-bold text-xl">{t("faqs")}</h1>
    </Card>
  );
};

export default FAQPage;
