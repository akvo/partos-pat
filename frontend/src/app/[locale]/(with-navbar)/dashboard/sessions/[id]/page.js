import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { HorizontalDivider, SessionWizard } from "@/components";
import { api } from "@/lib";

export const revalidate = 60;

const DashboardLink = () => {
  const t = useTranslations("Dashboard");
  return <Link href="/dashboard">{t("dashboard")}</Link>;
};

const StepTitle = ({ step = 1 }) => {
  const t = useTranslations("Session");
  return (
    <div className="w-full container mx-auto">
      <h2 className="font-bold text-lg">{t(`titleStep${parseInt(step)}`)}</h2>
    </div>
  );
};

const SessionDetailsPage = async ({ params, searchParams }) => {
  const patSession = await api("GET", `/sessions?id=${params.id}`);
  const { step } = searchParams || { step: 1 };
  return (
    <div className="w-full space-y-4">
      <div className="container mx-auto pt-2">
        <HorizontalDivider>
          <div className="pr-3">
            <DashboardLink />
          </div>
          <div className="px-3">
            <h1 className="font-bold text-xl">{patSession?.session_name}</h1>
          </div>
        </HorizontalDivider>
      </div>
      <StepTitle step={step} />
      <SessionWizard {...{ patSession, params }} currentStep={step} />
    </div>
  );
};

export default SessionDetailsPage;
