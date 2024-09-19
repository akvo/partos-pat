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

const PageContent = ({ activeSessions, closedSessions, totalClosed }) => {
  const t = useTranslations("Dashboard");
  return (
    <div className="w-full mb-8">
      <Tabs
        items={[
          {
            key: "active",
            label: t("activeSessions"),
            children: <ActiveSessionList data={activeSessions} />,
          },
          {
            key: "closed",
            label: t("closedSessions"),
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
        <Link href="/learn-more">
          <Button ghost>{t("learnMore")}</Button>
        </Link>
      </div>
    </Card>
  );
};

const HomeDashboardPage = async ({ searchParams }) => {
  const { session: sessionID } = searchParams;
  const { data: activeSessions } = await api(
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
            <CreateSessionModal />
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
