"use client";

import { useTranslations } from "next-intl";
import { Card, List } from "antd";

const ResourcesPage = () => {
  const t = useTranslations("Resources");

  const RESOURCE_LINKS = [
    {
      id: 1,
      url: "https://www.partos.nl/wat-we-doen/innovation-hub/new-ways-of-collaboration/",
    },
    {
      id: 2,
      url: "https://www.partos.nl/wat-we-doen/innovation-hub/inclusion/",
    },
    {
      id: 3,
      url: null,
    },
    {
      id: 4,
      url: "https://shiftthepower.org/",
    },
    {
      id: 5,
      url: "https://www.bond.org.uk/resources/this-is-the-work-pdf/",
    },
  ];

  return (
    <Card>
      <div className="w-full p-6 xl:p-12">
        <div className="w-full text-dark-10 space-y-5 mb-8">
          <h2 className="text-3xl xl:text-4xl font-extra-bold">{t("title")}</h2>
          <p className="text-base xl:text-lg">{t("subTitle")}</p>
        </div>
        <List bordered={false}>
          {RESOURCE_LINKS.map((item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={
                  <h3 className="font-bold text-lg xl:text-xl">
                    {t(`resource${item.id}`)}
                  </h3>
                }
                description={
                  <div className="w-full text-sm xl:text-base">
                    <p className="text-dark-7 mb-4">
                      {t(`resource${item.id}Desc`)}
                    </p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        className="font-bold text-dark-10 hover:text-primary-dark hover:underline"
                      >
                        {t("learnMore")}
                      </a>
                    )}
                  </div>
                }
              />
            </List.Item>
          ))}
        </List>
      </div>
    </Card>
  );
};

export default ResourcesPage;
