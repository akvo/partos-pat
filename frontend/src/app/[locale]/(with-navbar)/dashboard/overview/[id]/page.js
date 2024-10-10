import { Avatar, Button, Card, Flex, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { FacilitatorAvatar, HorizontalDivider } from "@/components";
import { api } from "@/lib";
import moment from "moment";
import countryOptions from "../../../../../../../i18n/countries.json";
import { ArrowFatIcon } from "@/components/Icons";

export const revalidate = 60;

const MAX_COUNTRIES = 5;

const Section = ({ children }) => (
  <div className="w-full pb-3 pt-6 space-y-5 border-b border-dark-2 text-base">
    {children}
  </div>
);

const PartnerSection = ({ patSession }) => {
  const t = useTranslations("SessionDetails");
  return (
    <>
      <Section>
        <h3 className="font-bold">{t("partnerOrgLong")}</h3>
      </Section>
      <div className="w-full pb-6 space-y-5 border-b border-dark-2 text-base">
        <ul className="w-full flex flex-col flex-wrap md:flex-row border-b border-light-grey-5">
          {patSession?.organizations?.map((item) => (
            <li
              className="w-full md:w-1/4 flex gap-3 px-3 py-2 odd:bg-light-grey-5 even:bg-light-1 border-b border-light-grey-7"
              key={item?.id}
            >
              <Avatar className="org">{item?.name?.[0]}</Avatar>
              <div>
                <strong className="text-grey-900">{item?.acronym}</strong>
                <p className="overflow-x-hidden text-sm text-ellipsis text-grey-600">
                  {item?.name}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const ParticipantSection = ({ participants = [] }) => {
  const t = useTranslations("SessionDetails");
  return (
    <>
      <Section>
        <h3 className="font-bold">{t("participants")}</h3>
      </Section>
      <div className="w-full pb-6 space-y-5 border-b border-dark-2 text-base">
        <ul className="w-full flex flex-col flex-wrap md:flex-row border-b border-light-grey-5">
          {participants?.map((item) => {
            const [firstName, lastName] = item?.full_name?.split(/\s/g);
            return (
              <li
                className="w-full md:w-1/4 flex flex-row items-center gap-3 px-3 py-2 odd:bg-light-grey-5 even:bg-light-1 border-b border-light-grey-7"
                key={item?.id}
              >
                <Avatar size={40} className="participant">
                  {firstName?.[0]?.toUpperCase() || ""}
                  {lastName?.[0]?.toUpperCase() || ""}
                </Avatar>
                <div>
                  <strong className="text-grey-900 font-semibold">{item?.full_name}</strong>
                  <p className="overflow-x-hidden text-sm text-ellipsis text-grey-600">
                    {item?.email}
                  </p>
                  <small className="overflow-x-hidden text-sm text-ellipsis text-grey-600">
                    {item?.role}
                  </small>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  );
};

const PageTitle = () => {
  const t = useTranslations("SessionDetails");
  return (
    <span className="text-base font-normal">{t("title")}</span>
  );
};

const ContextSection = ({ patSession }) => {
  const t = useTranslations("SessionDetails");
  return (
    <Section>
      <strong className="font-bold">{t("contextLong")}</strong>
      <div className="pb-6">
        <p className="text-dark-7">{patSession?.context}</p>
      </div>
    </Section>
  );
};

const DashboardLink = () => {
  const t = useTranslations("Dashboard");
  return <Link href="/dashboard">{t("dashboard")}</Link>;
};

const NextLink = ({ patSession }) => {
  const t = useTranslations("common");
  return (
    <div className="w-32">
      <Link href={`/dashboard/closed/${patSession?.id}`}>
        <Button type="primary" icon={<ArrowFatIcon />} iconPosition="end" block>
          {t("next")}
        </Button>
      </Link>
    </div>
  );
};

const OverviewSessionPage = async ({ params }) => {
  const patSession = await api("GET", `/sessions?id=${params.id}`);
  const participants = await api("GET", `/session/${params.id}/participants`);
  const countries = countryOptions?.filter((c) =>
    patSession?.countries?.includes(c?.["alpha-2"])
  );
  return (
    <div className="w-full space-y-4 overflow-y-auto">
      <div className="container mx-auto pt-2">
        <HorizontalDivider>
          <div className="pr-3">
            <DashboardLink />
          </div>
          <div className="px-3">
            <strong className="font-extra-bold text-base">{patSession?.session_name}</strong>
          </div>
        </HorizontalDivider>
      </div>
      <div className="w-full relative container mx-auto space-y-4 pb-4">
        <h1 className="font-bold text-2xl mb-2">{patSession?.session_name}</h1>
        <Card>
          <div className="p-6">
            <PageTitle />
            <Flex
              align="center"
              justify="space-between"
              className="pt-1.5 pb-3 border-b border-dark-2"
            >
              <div>
                <h2 className="font-bold text-2xl">{patSession?.session_name}</h2>
              </div>
              <div>
                <strong className="font-bold">
                  {moment(patSession?.date, "DD-MM-YYYY").format("DD/MM/YYYY")}
                </strong>
              </div>
            </Flex>

            <PartnerSection patSession={patSession} />

            <ParticipantSection participants={participants} />

            <ContextSection patSession={patSession} />

            <Flex className="mt-6" justify="space-between" align="center">
              <div>
                <FacilitatorAvatar
                  full_name={patSession?.facilitator?.full_name}
                />
              </div>
              <div>
                <ul>
                  {countries?.slice(0, MAX_COUNTRIES)?.map((c) => (
                    <li
                      key={c["alpha-2"]}
                      className="inline mr-4 bg-light-4 border border-dark-7 text-dark-7 text-sm font-semibold py-1.5 px-5 rounded-full"
                    >
                      {c?.name}
                    </li>
                  ))}
                  {countries?.length > MAX_COUNTRIES && (
                    <Tooltip
                      title={
                        <ul>
                          {countries
                            .slice(MAX_COUNTRIES, countries.length)
                            .map((c, cx) => (
                              <li key={cx}>{`* ${c?.name}`}</li>
                            ))}
                        </ul>
                      }
                    >
                      <li className="inline bg-light-4 border border-dark-7 text-dark-7 text-sm font-semibold py-1.5 px-2.5 rounded-full cursor-pointer">
                        {`${countries?.length - MAX_COUNTRIES}+`}
                      </li>
                    </Tooltip>
                  )}
                </ul>
              </div>
            </Flex>
          </div>
        </Card>
        <div className="w-full flex items-center justify-end">
          <NextLink patSession={patSession} />
        </div>
      </div>
    </div>
  );
};

export default OverviewSessionPage;
