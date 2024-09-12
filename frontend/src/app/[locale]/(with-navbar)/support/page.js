import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { HorizontalDivider } from "@/components";

const SupportPage = () => {
  const t = useTranslations("Dashboard");
  return (
    <HorizontalDivider>
      <div className="pr-3">
        <Link href="/dashboard">{t("dashboard")}</Link>
      </div>
      <div className="px-3">
        <h1 className="font-bold text-xl">{t("support")}</h1>
      </div>
    </HorizontalDivider>
  );
};

export default SupportPage;