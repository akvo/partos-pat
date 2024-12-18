import { useTranslations } from "next-intl";
import { Card } from "antd";
import classNames from "classnames";
import { openSans } from "@/app/fonts";
import dynamic from "next/dynamic";
import { api } from "@/lib";
import { PAT_COLORS, SESSION_PURPOSE } from "@/static/config";

const IntroSection = () => {
  const t_dashboard = useTranslations("Dashboard");
  return (
    <div className="w-full space-y-2 my-4 pb-4 border-b border-grey-100">
      <h1 className="font-extra-bold text-xl">{t_dashboard("statistics")}</h1>
    </div>
  );
};

const Last3YearTitleSection = () => {
  const t = useTranslations("Statistics");
  return (
    <div className="w-full space-y-2 my-4 pb-4 border-b border-grey-100">
      <h1 className="font-extra-bold text-xl">{t("noSessionCreated")}</h1>
    </div>
  );
};

const GridChartSection = ({
  total_users = 0,
  total_users_last_30 = 0,
  total_session_completed_last_30 = 0,
  total_session_completed = 0,
}) => {
  const t = useTranslations("Statistics");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
      <div className="bg-light-grey-3">
        <Card className="inherit">
          <div className="w-full min-h-20 flex flex-col justify-between">
            <strong className="font-extra-bold text-base">
              {t("noAccounts")}
            </strong>
            <h1 className="font-extra-bold text-5xl">{total_users}</h1>
          </div>
        </Card>
      </div>
      <div className="bg-light-grey-3">
        <Card className="inherit">
          <div className="w-full min-h-20 flex flex-col justify-between">
            <strong className="font-extra-bold text-base">
              {t("noAccountsLast30")}
            </strong>
            <h1 className="font-extra-bold text-5xl">{total_users_last_30}</h1>
          </div>
        </Card>
      </div>
      <div className="bg-light-grey-3">
        <Card className="inherit">
          <div className="w-full min-h-28 flex flex-col justify-between">
            <strong className="font-extra-bold text-base">
              {t("noSessionCompleted")}
            </strong>
            <h1 className="font-extra-bold text-5xl">
              {total_session_completed}
            </h1>
          </div>
        </Card>
      </div>
      <div className="bg-light-grey-3">
        <Card className="inherit">
          <div className="w-full min-h-28 flex flex-col justify-between">
            <strong className="font-extra-bold text-base">
              {t("noSessionCompletedLast30")}
            </strong>
            <h1 className="font-extra-bold text-5xl">
              {total_session_completed_last_30}
            </h1>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AccountPurposeLegend = () => {
  const t = useTranslations("common");
  return (
    <div className="w-full space-y-3">
      {PAT_COLORS.SESSION_PURPOSE.map((color, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="p-2 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-xs">
            {t.rich(SESSION_PURPOSE?.[index + 1], {
              b: (token) => <b>{token}</b>,
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

const AccountPurposeTitle = () => {
  const t = useTranslations("Statistics");
  return (
    <strong className="font-extra-bold text-base">
      {t("noAccountPurpose")}
    </strong>
  );
};

const StatisticsPage = async () => {
  const { total_users, total_users_last_30_days } = await api(
    "GET",
    "/admin/statistics/users",
  );

  const { total_sessions_per_category } = await api(
    "GET",
    "/admin/statistics/sessions",
  );

  const { total_completed, total_completed_last_30_days } = await api(
    "GET",
    "/admin/sessions/completed",
  );

  const sessionStats = await api("GET", "/admin/sessions/per-last-3-years");

  const AccountPurposeChart = dynamic(
    () => import("@/components/Charts/AccountPurposeChart"),
    { ssr: false },
  );

  const SessionLast3YearsChart = dynamic(
    () => import("@/components/Charts/SessionLast3YearsChart"),
    { ssr: false },
  );

  return (
    <div className={classNames(openSans.className, "w-full space-y-8")}>
      <Card>
        <div className="w-full space-y-6 py-6 px-2">
          <IntroSection />
          <div className="w-full flex flex-col lg:flex-row items-start gap-x-4">
            <div className="w-full lg:w-1/2">
              <GridChartSection
                total_users={total_users}
                total_users_last_30={total_users_last_30_days}
                total_session_completed_last_30={total_completed_last_30_days}
                total_session_completed={total_completed}
              />
            </div>
            <div className="w-full lg:w-1/2 space-y-3 bg-light-grey-3 p-1">
              <div className="w-full px-4 py-2">
                <AccountPurposeTitle />
              </div>
              <div className="w-full flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2 min-h-28">
                  <AccountPurposeChart data={total_sessions_per_category} />
                </div>
                <div className="w-full lg:w-1/2 min-h-28">
                  <AccountPurposeLegend />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="w-full space-y-6">
          <Last3YearTitleSection />
          <SessionLast3YearsChart data={sessionStats} />
        </div>
      </Card>
    </div>
  );
};

export default StatisticsPage;
