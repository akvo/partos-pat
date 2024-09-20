import { Button, Card, Col, Row, Space, Tabs } from "antd";
import { useTranslations } from "next-intl";
import {
  ActiveSessionList,
  ClosedSessionList,
  CreateSessionModal,
  DetailSessionModal,
  JoinModal,
} from "@/components";

import { Link } from "@/routing";
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
    <div className="w-full mb-8 text-base">
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
            label: (
              <Space>
                <span>{t("closedSessions")}</span>
                <span className="badge-number py-px px-2 border border-dark-2 rounded-full">
                  {totalClosed}
                </span>
              </Space>
            ),
            children: (
              <ClosedSessionList
                data={closedSessions}
                totalClosed={totalClosed}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

const AboutCard = () => {
  const t = useTranslations("Dashboard");
  return (
    <Card bordered={false}>
      <div className="w-full p-1 md:px-4 md:py-2">
        <h2 className="text-2xl text-dark-10 font-bold mb-6">
          {t("aboutTitle")}
        </h2>
        <div className="mb-8">
          <p>{t("aboutDescription")}</p>
        </div>
        <Link href="/dashboard/learn-more">
          <Button ghost>{t("learnMore")}</Button>
        </Link>
      </div>
    </Card>
  );
};

const HomeDashboardPage = async ({ searchParams }) => {
  const { session: sessionID } = searchParams;
  const { data: activeSessions, total: totalActive } = await api(
    "GET",
    `/sessions?page_size=${PAT_SESSION.pageSize}`
  );
  const { data: closedSessions, total: totalClosed } = await api(
    "GET",
    `/sessions?published=true&page_size=${PAT_SESSION.pageSize}`
  );

  return (
    <div className="w-full space-y-6">
      <Row type="flex" justify="space-between" wrap>
        <Col lg={16} xl={18}>
          <PageTitle />
        </Col>
        <Col lg={8} xl={6} className="text-right">
          <Space size="middle">
            <JoinModal />
            <CreateSessionModal
              disabled={totalActive >= PAT_SESSION.maxActiveSession}
            />
            <DetailSessionModal id={sessionID} />
          </Space>
        </Col>
      </Row>
      <Row gutter={[24, 16]} type="flex" justify="space-between">
        <Col lg={16} xl={18}>
          <PageContent
            {...{
              activeSessions,
              closedSessions,
              totalClosed,
              totalActive,
            }}
          />
        </Col>
        <Col lg={8} xl={6}>
          <AboutCard />
        </Col>
      </Row>
    </div>
  );
};

export default HomeDashboardPage;
