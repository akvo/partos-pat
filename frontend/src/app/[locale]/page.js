import {
  AkvoIcon,
  CaretRight,
  InstagramIcon,
  LindkedInIcon,
  PartosLogo,
  QuoteIcon,
  TwitterXIcon,
} from "@/components/Icons";
import { Link } from "@/routing";
import { Button, Flex } from "antd";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { openSans, sourceSansPro } from "../fonts";
import { PARTOS } from "@/static/config";
import { FAQCollapsible, LandingButton } from "@/components";
import { getSession } from "@/lib/auth";

const FooterCreditSection = () => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full py-3 bg-dark-10">
      <div className="container mx-auto 2xl:px-4">
        <Flex items="center" justify="space-between">
          <div className="text-sm xl:text-base text-light-1">
            {t("poweredBy")}
          </div>
          <div>
            <AkvoIcon />
          </div>
        </Flex>
      </div>
    </div>
  );
};

const FooterCopySection = () => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full pt-8 pb-8 text-grey-800">
      <div className="container mx-auto 2xl:px-4 flex flex-row flex-wrap items-center justify-between">
        <div className="w-fit flex flex-wrap items-center gap-5">
          <span className="text-xs xl:text-sm">&copy; Copyright 2024</span>
          <span>
            <Link
              href="https://www.partos.nl/en/cookies/"
              className="text-xs xl:text-sm hover:underline"
              target="_blank"
            >
              {t("cookies")}
            </Link>
          </span>
          <span>
            <Link
              href="https://www.partos.nl/en/terms-and-conditions/"
              className="text-xs xl:text-sm hover:underline"
              target="_blank"
            >
              {t("termNConditions")}
            </Link>
          </span>
        </div>
        <div className="w-fit h-20 bg-grey-100 flex flex-row items-start gap-4">
          <a
            href="https://www.belastingdienst.nl/rekenhulpen/anbi_zoeken/"
            target="_blank"
          >
            <Image
              src="/images/footer-ANBI.svg"
              className="w-full h-20"
              width={100}
              height={80}
              alt="ANBI"
            />
          </a>
          <span>
            <Image
              src="/images/footer-partos-9001.jpg"
              className="w-full h-20 invert-[5%]"
              width={132}
              height={80}
              alt="Partos 9001"
            />
          </span>
          <span>
            <Image
              src="/images/footer-EIK.png"
              className="w-full h-20 invert-[5%]"
              width={84}
              height={80}
              alt="EIK"
            />
          </span>
        </div>
      </div>
    </div>
  );
};

const FooterLink = ({ href, children }) => (
  <li className="transition duration-150 ease-out hover:translate-x-1 pat-footer-item">
    <a
      href={href}
      target="_blank"
      className="flex flex-row items-center gap-1 hover:underline"
    >
      <span className="pat-footer-caret">
        <CaretRight size={12} />
      </span>
      <span>{children}</span>
    </a>
  </li>
);

const FooterLinkContainer = ({ title, children }) => (
  <div className="w-full md:w-1/2 lg:w-3/12 space-y-8 xl:space-y-6 mb-4">
    <h3 className="font-bold text-base xl:text-lg text-grey-800">{title}</h3>
    {children}
  </div>
);

const FooterLinksSection = () => {
  const t = useTranslations("Landing");
  return (
    <div
      className={classNames(
        sourceSansPro.className,
        "w-full pb-2 pt-12 xl:pt-14 bg-footer bg-no-repeat bg-contain bg-right-bottom",
      )}
    >
      <div className="w-full">
        <div className="container mx-auto 2xl:px-4 flex flex-wrap">
          <FooterLinkContainer title={t("topics")}>
            <ul className="text-sm xl:text-base text-dark-7 space-y-2">
              <FooterLink href="https://www.partos.nl/en/news/">
                {t("topics1")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/events/">
                {t("topics2")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/member-vacancies/">
                {t("topics3")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/subscribe-newsletter/">
                {t("topics4")}
              </FooterLink>
            </ul>
          </FooterLinkContainer>
          <FooterLinkContainer title={t("forMembers")}>
            <ul className="text-sm xl:text-base text-dark-7 space-y-2">
              <FooterLink href="/login">{t("login")}</FooterLink>
              <FooterLink href="https://www.partos.nl/en/activity/political-monitor/">
                {t("forMembers2")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/about-partos/partos-code-of-conduct-integrity/">
                {t("forMembers3")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/publication/partos-9001/">
                {t("forMembers4")}
              </FooterLink>
            </ul>
          </FooterLinkContainer>
          <FooterLinkContainer title={t("mostVisited")}>
            <ul className="text-sm xl:text-base text-dark-7 space-y-2">
              <FooterLink href="https://www.partos.nl/en/about-partos/">
                {t("mostVisited1")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/leden/our-members/">
                {t("mostVisited2")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/publications-results/">
                {t("mostVisited3")}
              </FooterLink>
              <FooterLink href="https://www.partos.nl/en/member-vacancies/">
                {t("topics3")}
              </FooterLink>
            </ul>
          </FooterLinkContainer>
          <FooterLinkContainer title={t("contact")}>
            <ul className="text-sm xl:text-base text-dark-7 space-y-5">
              <li className="whitespace-pre-line">{PARTOS.address}</li>
              <li>
                <a href={`tel:${PARTOS.phone}`}>
                  <strong>{PARTOS.phone}</strong>
                </a>
                <br />
                <a href={`mailto:${PARTOS.email}`}>
                  <strong>{PARTOS.email}</strong>
                </a>
              </li>
              <li className="whitespace-pre-line">{PARTOS.code}</li>
            </ul>
            <div className="w-full flex flex-row gap-2 items-center">
              <a
                href="https://twitter.com/PartosNL"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="p-2.5 bg-primary-normal rounded-sm">
                  <TwitterXIcon />
                </div>
              </a>
              <a
                href="https://nl.linkedin.com/company/partos"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="p-2.5 bg-primary-normal rounded-sm">
                  <LindkedInIcon />
                </div>
              </a>
              <a
                href="https://www.instagram.com/partosnl/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="p-2.5 bg-primary-normal rounded-sm">
                  <InstagramIcon />
                </div>
              </a>
            </div>
          </FooterLinkContainer>
        </div>
      </div>
      <FooterCopySection />
    </div>
  );
};

const QuoteSection = () => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full bg-primary-active py-16">
      <div className="container mx-auto 2xl:px-4">
        <div className="w-full flex gap-6 justify-center">
          <div className="w-full relative lg:w-8/12 border-l-4 border-l-light-1 pl-6 px-4 md:pl-12">
            <QuoteIcon className="w-8 md:w-10 lg:w-12 absolute top-[-10px] left-[-17px] md:top-[-5px] md:left-[-20px] lg:top-[-2px] lg:left-[-24px]" />
            <em className="text-dark-10 text-lg xl:text-xl leading-9">
              {t("quotes")}
            </em>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewWaysSection = () => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full py-16">
      <div className="container mx-auto 2xl:px-4">
        <div className="w-full bg-primary-active rounded-md flex flex-col md:flex-row items-center">
          <div className="w-full md:w-2/5 lg:w-1/2 flex flex-col items-center py-12">
            <Image
              width={400}
              height={400}
              src="/images/new-ways-collaboration.png"
              alt="New Ways Collaboration"
              className="w-10/12 xl:w-8/12"
            />
          </div>
          <div className="w-full md:w-3/5 lg:w-1/2 space-y-5 xl:space-y-12 px-4 lg:px-8 lg:pl-0 lg:pr-20 py-12 text-dark-10">
            <div>
              <h2 className="text-4xl xl:text-5xl font-extra-bold">
                {t("newWaysTitle")}
              </h2>
            </div>
            <div className="w-full md:w-10/12">
              <strong className="text-base xl:text-xl leading-8 font-bold whitespace-pre-line">
                {t("newWaysDesc1")}
              </strong>
            </div>
            <p className="text-sm xl:text-base whitespace-pre-line">
              {t("newWaysDesc2")}
            </p>
            <div>
              <a
                href="https://www.partos.nl/wat-we-doen/innovation-hub/new-ways-of-collaboration/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button ghost>{t("learnMore")}</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorkSection = () => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full bg-light-1 py-9 xl:py-16">
      <div className="container mx-auto 2xl:px-4">
        <div className="w-full relative">
          <div className="w-8/12 lg:w-full relative flex flex-col flex-wrap lg:flex-row items-center gap-4">
            <div className="w-full lg:w-7/12 xl:w-8/12 space-y-5 xl:space-y-10 text-dark-10">
              <h2 className="text-2xl xl:text-3xl font-extra-bold">
                {t("howItWork")}
              </h2>
              <div className="pb-10">
                <p className="text-sm xl:text-base">{t("howItWorkDesc")}</p>
              </div>
              <a
                href={PARTOS.PATGuidelineLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="primary">{t("learnMore")}</Button>
              </a>
            </div>
          </div>
          <div className="w-4/12 h-80 hidden md:block absolute top-[5rem] xl:top-[-1rem] right-0 mr-0 2xl:mr-12">
            <div className="w-full xl:w-8/12 absolute z-10 top-0 right-0">
              <Image
                src="/images/how-its-work-person.png"
                alt="How it Works person"
                width={300}
                height={300}
                className="w-full"
              />
            </div>
          </div>
          <div className="w-6/12 xl:w-5/12 hidden md:block z-0 absolute top-[-5rem] right-[-6rem] lg:top-0 lg:right-[-4rem] xl:top-[-10rem] 2xl:top-[-12rem] xl:right-[-10rem]">
            <Image
              src="/images/partos-circle-multicolor.png"
              alt="How it Works circle"
              width={500}
              height={500}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const WhySection = () => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full my-8">
      <div className="container mx-auto 2xl:px-4 py-12 xl:py-24 border-t border-t-dark-2">
        <div className="w-full flex flex-wrap items-center">
          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <h2 className="text-3xl xl:text-4xl text-grey-900 font-extra-bold">
                {t("whyUsePAT")}
              </h2>
            </div>
            <div className="w-full lg:w-9/12">
              <p className="text-base xl:text-lg text-grey-600">
                {t("whyUseSubtitle")}
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 text-base text-dark-7">
            <p className="text-sm xl:text-base whitespace-pre-line">
              {t("whyUseText1")}
            </p>
            <br />
            <p className="text-sm xl:text-base whitespace-pre-line">
              {t("whyUseText2")}
            </p>
            <ul className="list-disc ml-8">
              <li>{t("whyUseText2a")}</li>
              <li>{t("whyUseText2b")}</li>
              <li>{t("whyUseText2c")}</li>
              <li>{t("whyUseText2d")}</li>
            </ul>
            <p className="text-sm xl:text-base whitespace-pre-line">
              {t("whyUseTextEnd")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PartnerSection = () => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full py-9 xl:py-16">
      <div className="container mx-auto 2xl:px-4 space-y-12">
        <div className="w-full text-center">
          <strong className="text-sm xl:text-base text-grey-600 font-extra-bold">
            {t("madePossibleBy")}
          </strong>
        </div>
        <ul className="w-full flex flex-wrap justify-between">
          {Array.from({ length: 7 }).map((_, index) => {
            return (
              <li key={index}>
                <Image
                  src={`/images/logo${index + 1}.png`}
                  alt={`Partner ${index + 1}`}
                  width={151}
                  height={151}
                  className="w-24 xl:w-full mb-3"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export const HeroSection = ({ isLoggedIn = false }) => {
  const t = useTranslations("Landing");
  return (
    <div className="w-full flex flex-col items-center justify-center gap-9 pt-20 mb-4">
      <h1 className="text-4xl xl:text-5xl text-center font-extra-bold">
        {t("title")}
      </h1>
      <div className="w-full lg:w-10/12 2xl:w-8/12 text-center">
        <p className="text-lg xl:text-xl text-dark-10 leading-8">
          {t("description")}
        </p>
      </div>
      <Link href={isLoggedIn ? "/dashboard" : "/register"}>
        <Button type="primary" size="large" className="w-fit min-w-36">
          {t("createAccount")}
        </Button>
      </Link>
    </div>
  );
};

const Home = async ({ params }) => {
  const session = await getSession();
  return (
    <main
      className={classNames(
        openSans.className,
        openSans.variable,
        "w-full max-w-9xl h-screen bg-grey-100 text-base text-dark-10 overflow-y-auto",
      )}
    >
      <div className="w-full relative bg-landing-gradient backdrop-blur">
        <div className="w-2/6 h-full absolute top-0 left-0 bg-landing-circle bg-no-repeat bg-contain bg-left-top" />
        <div className="container mx-auto 2xl:px-4">
          <div className="w-full relative flex flex-col md:flex-row items-center py-6 justify-between">
            <div className="z-10 w-20">
              <a href="https://www.partos.nl/" target="_blank">
                <PartosLogo width="80" height="56" />
              </a>
            </div>
            <LandingButton isLoggedIn={session?.user?.id ? true : false} />
          </div>

          <HeroSection isLoggedIn={session?.user?.id ? true : false} />
        </div>
        <div className="w-full relative px-10">
          <Image
            src={`/images/mockup-preview-${params?.locale || "en"}.png`}
            alt="PARTOS PAT Preview"
            width={1280}
            height={448}
            className="w-full z-10"
          />
        </div>
      </div>

      <PartnerSection />

      <WhySection />

      <HowItWorkSection />

      <NewWaysSection />

      <div className="w-full bg-light-1 py-16">
        <div className="container mx-auto 2xl:px-4">
          <FAQCollapsible isPublic />
        </div>
      </div>

      <QuoteSection />

      <FooterLinksSection />

      <FooterCreditSection />
    </main>
  );
};

export default Home;
