import { useTranslations } from "next-intl";
import { Link } from "@/routing";

const SupportPage = () => {
  const t = useTranslations("Dashboard");
  return (
    <div className="w-fit lg:w-1/5 py-4">
      <div className="flex divide-x-2 divide-solid">
        <div className="pr-3">
          <Link href="/dashboard">{t("dashboard")}</Link>
        </div>
        <div className="px-3">
          <h1 className="font-bold text-xl">{t("support")}</h1>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
