import { Button, Card, Space, Tabs } from "antd";
import { useTranslations } from "next-intl";
import {
  ActiveSessionList,
  ClosedSessionList,
  CreateSessionModal,
  DetailSessionModal,
  JoinModal,
  TotalClosedLabel,
} from "@/components";

import { api } from "@/lib";
import { PAT_SESSION } from "@/static/config";

const PageTitle = () => {
  const t = useTranslations("Dashboard");
  return (
    <>
      <h1 className="font-bold text-2xl">{t("title")}</h1>
      <p>{t("subtitle")}</p>
    </>
  );
};

const PageContent = ({
  activeSessions,
  closedSessions,
  totalClosed,
  totalActive,
}) => {
  const t = useTranslations("Dashboard");
  return (
    <div className="w-full my-6 text-base">
      <Tabs
        items={[
          {
            key: "active",
            label: (
              <Space>
                <span>{t("activeSessions")}</span>
                <span className="badge-number py-px px-2 border border-dark-2 rounded-full">
                  {totalActive}
                </span>
              </Space>
            ),
            children: <ActiveSessionList data={activeSessions} />,
          },
          {
            key: "closed",
            label: <TotalClosedLabel initialTotalClosed={totalClosed} />,
            children: (
              <ClosedSessionList
                data={closedSessions}
                totalClosed={totalClosed}
              />
            ),
          },
        ]}
      />
      {totalActive === 0 && totalClosed === 0 && (
        <Card>
          <div className="w-full px-4 py-8">
            <div className="w-full py-3 border-b border-b-dark-2 mb-6">
              <h3 className="font-bold text-2xl">{t("gettingStarted")}</h3>
            </div>
            <div className="w-full flex">
              <div className="w-full lg:w-1/2 space-y-3">
                <h4 className="text-dark-2 text-xl font-bold">
                  {t("createNewTitle")}
                </h4>
                <ol className="list-decimal ml-4 text-base text-dark-10 leading-8">
                  <li>{t("createStep1")}</li>
                  <li>{t("createStep2")}</li>
                  <li>{t("createStep3")}</li>
                </ol>
                <div className="pt-16">
                  <CreateSessionModal />
                </div>
              </div>
              <div className="w-full lg:w-1/2 space-y-3">
                <h4 className="text-dark-2 text-xl font-bold">
                  {t("joinTitle")}
                </h4>
                <ol className="list-decimal ml-4 text-base text-dark-10 leading-8">
                  <li>{t("joinStep1")}</li>
                  <li>{t("joinStep2")}</li>
                  <li>{t("joinStep3")}</li>
                </ol>
                <div className="pt-8">
                  <JoinModal />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const AboutCard = () => {
  const t = useTranslations("Dashboard");
  return (
    <Card className="w-full lg:w-10/12 max-w-[390px]" bordered={false}>
      <div className="w-full p-1 lg:px-4 lg:py-2">
        <h2 className="text-2xl text-dark-10 font-bold mb-6 whitespace-pre-line">
          {t("aboutTitle")}
        </h2>
        <div className="mb-8 max-h-[450px] text-base overflow-y-scroll">
          <p className="whitespace-pre-line">{t("aboutDescription")}</p>
        </div>
        <a
          href="https://www.partos.nl/wp-content/uploads/2024/04/The-Power-Awareness-Tool-2.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button ghost>{t("learnMore")}</Button>
        </a>
      </div>
    </Card>
  );
};

const HomeDashboardPage = async ({ searchParams }) => {
  const { session: sessionID } = searchParams;
  const { data: activeSessions, total: totalActive } = await api(
    "GET",
    `/sessions?page_size=${PAT_SESSION.pageSize}`,
  );
  const { data: closedSessions, total: totalClosed } = await api(
    "GET",
    `/sessions?published=true&page_size=${PAT_SESSION.pageSize}`,
  );
  const myActiveSession = activeSessions?.find((s) => s?.is_owner);
  const newButtonDisabled = myActiveSession ? true : false;
  const webdomain = process.env.WEBDOMAIN;

  return (
    <div className="w-full px-5 py-8 space-y-6">
      <div className="w-full flex md:max-lg:flex-col flex-row gap-12">
        <div className="w-full lg:w-3/5">
          <PageTitle />
          <PageContent
            {...{
              activeSessions,
              closedSessions,
              totalClosed,
              totalActive,
            }}
          />
        </div>
        <div className="w-full lg:w-2/5">
          <Space
            align="center"
            size="middle"
            className="w-full lg:w-10/12 max-w-[390px] mb-8 justify-end"
          >
            <JoinModal />
            <CreateSessionModal disabled={newButtonDisabled} />
            <DetailSessionModal id={sessionID} webdomain={webdomain} />
          </Space>
          <AboutCard />
        </div>
      </div>
    </div>
  );
};

export default HomeDashboardPage;
