import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { HorizontalDivider, SessionWizard } from "@/components";
import { api } from "@/lib";

export const revalidate = 60;

const DashboardLink = () => {
  const t = useTranslations("Dashboard");
  return <Link href="/dashboard">{t("dashboard")}</Link>;
};

const SessionDetailsPage = async ({ params }) => {
  const patSession = await api("GET", `/sessions?id=${params.id}`);
  return (
    <div className="w-full space-y-4">
      <div className="container mx-auto pt-2">
        <HorizontalDivider>
          <div className="pr-3">
            <DashboardLink />
          </div>
          <div className="px-3">
            <strong className="font-bold text-base">{patSession?.session_name}</strong>
          </div>
        </HorizontalDivider>
      </div>
      <SessionWizard {...{ patSession, params }} />
    </div>
  );
};

export default SessionDetailsPage;
