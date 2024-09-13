"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "antd";
import { PartosLogo } from "@/components/Icons";
import { Link } from "@/routing";
import { sourceSans } from "@/app/fonts";

const NotFoundPage = () => {
  const { locale } = useParams();

  const t = useTranslations("NotFound");
  return (
    <html lang={locale}>
      <body className={sourceSans.className}>
        <div className="w-full max-w-9xl h-screen bg-grey flex flex-col items-center justify-center space-y-8 text-base text-dark-10">
          <div className="text-center">
            <Link href="/">
              <PartosLogo width={125} height={125} />
            </Link>
          </div>
          <div className="text-center leading-normal">
            <h1 className="font-bold text-[120px]">404</h1>
            <h2 className="font-bold text-3xl">{t("title")}</h2>
          </div>
          <div className="w-full md:w-[420px] h-auto text-center">
            <p>{t("description")}</p>
          </div>
          <div className="w-48">
            <Link href="/">
              <Button type="primary" block>
                {t("backButton")}
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
};

export default NotFoundPage;
