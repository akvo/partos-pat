import { Button, Card, Col, Row, Space } from "antd";
import { useTranslations } from "next-intl";
import {
  ActiveSessionList,
  ClosedSessionList,
  CreateSessionModal,
  JoinModal,
} from "@/components";
import { FolderSimplePlus } from "@/components/Icons";

import closedSessions from "@/static/json/closed-sessions.json";
import activeSessions from "@/static/json/active-sessions.json";
import { Link } from "@/routing";

const HomeDashboardPage = () => {
  const t = useTranslations("Dashboard");
  const initialActiveList = activeSessions.filter((a) => a?.user_id === 1);

  return (
    <div className="w-full space-y-6">
      <Row type="flex" justify="space-between" wrap>
        <Col lg={16} xl={18}>
          <h1 className="font-bold text-2xl">{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </Col>
        <Col lg={8} xl={6} className="text-right">
          <Space size="middle">
            <JoinModal />
            <CreateSessionModal />
          </Space>
        </Col>
      </Row>
      <Row gutter={[24, 16]} type="flex" justify="space-between">
        <Col lg={16} xl={18}>
          <div className="w-full mb-8">
            <ActiveSessionList data={initialActiveList} />
          </div>
          <div className="w-full space-y-4">
            <h2 className="font-bold text-xl">{t("closedSessions")}</h2>
            <ClosedSessionList data={closedSessions} />
          </div>
        </Col>
        <Col lg={8} xl={6}>
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
        </Col>
      </Row>
    </div>
  );
};

export default HomeDashboardPage;
