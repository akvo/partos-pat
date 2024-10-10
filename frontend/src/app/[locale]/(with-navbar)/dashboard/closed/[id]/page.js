import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { HorizontalDivider, SessionView } from "@/components";
import { api } from "@/lib";

export const revalidate = 60;

const DashboardLink = () => {
  const t = useTranslations("Dashboard");
  return <Link href="/dashboard">{t("dashboard")}</Link>;
};

const ClosedSessionPage = async ({ params }) => {
  const patSession = await api("GET", `/sessions?id=${params.id}`);
  return (
    <div className="w-full space-y-4">
      <div className="container mx-auto pt-2">
        <HorizontalDivider>
          <div className="pr-3">
            <DashboardLink />
          </div>
          <div className="px-3">
            <h1 className="font-bold text-base">{patSession?.session_name}</h1>
          </div>
        </HorizontalDivider>
      </div>
      <SessionView {...{ patSession, params }} />
    </div>
  );
};

export default ClosedSessionPage;
