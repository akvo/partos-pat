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
import classNames from "classnames";

const PageTitle = () => {
  const t = useTranslations("Dashboard");
  return (
    <div className="w-full space-y-2">
      <h1 className="font-bold text-xl xl:text-2xl">{t("title")}</h1>
      <p className="w-11/12 text-sm xl:text-base">{t("subtitle")}</p>
    </div>
  );
};

const GettingStartedCard = () => {
  const t = useTranslations("Dashboard");
  return (
    <Card>
      <div className="w-full px-2 lg:px-4 py-8">
        <div className="w-full py-3 border-b border-b-dark-2 mb-6">
          <h3 className="font-bold text-xl xl:text-2xl">
            {t("gettingStarted")}
          </h3>
        </div>
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="w-full h-64 flex flex-col justify-between lg:w-1/2 space-y-3">
            <div className="w-full">
              <h4 className="text-dark-2 text-lg xl:text-xl font-bold">
                {t("createNewTitle")}
              </h4>
              <ol className="list-decimal ml-4 text-sm xl:text-base text-dark-10 leading-6 xl:leading-8">
                <li>{t("createStep1")}</li>
                <li>{t("createStep2")}</li>
                <li>{t("createStep3")}</li>
              </ol>
            </div>

            <div className="w-8/12 2xl:max-w-64">
              <CreateSessionModal />
            </div>
          </div>
          <div className="w-full h-64 flex flex-col justify-between lg:w-1/2 space-y-3">
            <div className="w-full">
              <h4 className="text-dark-2 text-lg xl:text-xl font-bold">
                {t("joinTitle")}
              </h4>
              <ol className="list-decimal ml-4 text-sm xl:text-base text-dark-10 leading-6 xl:leading-8">
                <li>{t("joinStep1")}</li>
                <li>{t("joinStep2")}</li>
                <li>{t("joinStep3")}</li>
              </ol>
            </div>

            <div className="w-8/12 2xl:max-w-40">
              <JoinModal />
            </div>
          </div>
        </div>
      </div>
    </Card>
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
            children: (
              <div className="w-full flex md:max-lg:flex-col flex-row gap-4 2xl:gap-12">
                <div className="w-full lg:w-4/6 xl:w-4/6 2xl:w-3/5">
                  <ActiveSessionList data={activeSessions} />
                </div>
                <div
                  className={classNames("w-full lg:w-2/6 xl:w-2/6 2xl:w-2/5", {
                    hidden: totalActive === 0,
                  })}
                >
                  <AboutCard />
                </div>
              </div>
            ),
          },
          {
            key: "closed",
            label: <TotalClosedLabel initialTotalClosed={totalClosed} />,
            children: (
              <div className="w-full flex md:max-lg:flex-col flex-row gap-4 xl:gap-12">
                <div className="w-full lg:w-4/6 xl:w-4/6 2xl:w-3/5">
                  <ClosedSessionList
                    data={closedSessions}
                    totalClosed={totalClosed}
                  />
                </div>
                <div
                  className={classNames("w-full lg:w-2/6 xl:w-2/6 2xl:w-2/5", {
                    hidden: totalClosed === 0 && totalActive === 0,
                  })}
                >
                  <AboutCard />
                </div>
              </div>
            ),
          },
        ]}
      />
      {totalActive === 0 && totalClosed === 0 && (
        <div className="w-full flex md:max-lg:flex-col flex-row gap-4 xl:gap-12">
          <div className="w-full lg:w-4/6 xl:w-4/6 2xl:w-3/5">
            <GettingStartedCard />
          </div>
          <div className="w-full lg:w-2/6 xl:w-2/6 2xl:w-2/5">
            <AboutCard isEmpty={true} />
          </div>
        </div>
      )}
    </div>
  );
};

const AboutCard = ({ isEmpty = false }) => {
  const t = useTranslations("Dashboard");
  return (
    <div
      className={classNames("w-full 2xl:w-10/12 max-w-[390px] pt-0", {
        "lg:pt-14 xl:pt-0": !isEmpty,
      })}
    >
      <Card bordered={false}>
        <div className="w-full p-1 xl:px-4 xl:py-2">
          <h2 className="text-xl xl:text-2xl text-dark-10 font-bold mb-6 whitespace-pre-line">
            {t("aboutTitle")}
          </h2>
          <div className="mb-8 max-h-[450px] text-sm xl:text-base overflow-y-scroll">
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
    </div>
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
      <div className="w-full flex md:max-lg:flex-col flex-row gap-4 xl:gap-6 2xl:gap-12">
        <div className="w-full xl:w-4/6 2xl:w-3/5">
          <PageTitle />
        </div>
        <div className="w-96 xl:w-2/6 2xl:w-2/5 flex flex-row items-center justify-start gap-4">
          <JoinModal />
          <CreateSessionModal disabled={newButtonDisabled} />
          <DetailSessionModal id={sessionID} webdomain={webdomain} />
        </div>
      </div>
      <PageContent
        {...{
          activeSessions,
          closedSessions,
          totalClosed,
          totalActive,
        }}
      />
    </div>
  );
};

export default HomeDashboardPage;
