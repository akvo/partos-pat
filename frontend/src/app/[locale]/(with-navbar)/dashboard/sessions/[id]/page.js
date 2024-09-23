import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { HorizontalDivider } from "@/components";
import { api } from "@/lib";

export const revalidate = 60;

const DashboardLink = () => {
  const t = useTranslations("Dashboard");
  return <Link href="/dashboard">{t("dashboard")}</Link>;
};

const SessionDetailsPage = async ({ params }) => {
  const patSession = await api("GET", `/sessions?id=${params.id}`);

  return (
    <HorizontalDivider>
      <div className="pr-3">
        <DashboardLink />
      </div>
      <div className="px-3">
        <h1 className="font-bold text-xl">{patSession?.session_name}</h1>
      </div>
    </HorizontalDivider>
  );
};

export default SessionDetailsPage;
