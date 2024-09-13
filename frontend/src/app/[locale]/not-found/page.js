"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "antd";
import { PartosLogo } from "@/components/Icons";
import { Link } from "@/routing";
import { sourceSans } from "@/app/fonts";
import classNames from "classnames";

const NotFoundPage = () => {
  const { locale } = useParams();

  const t = useTranslations("NotFound");
  return (
    <html lang={locale}>
      <body className={classNames(sourceSans.className, "bg-grey")}>
        <div className="w-full relative max-w-9xl h-screen flex flex-col items-center justify-center space-y-8 text-base text-dark-10">
          <div className="w-1/2 lg:w-2/5 h-screen absolute bottom-0 right-0 bg-not-found bg-no-repeat bg-contain bg-right-bottom" />
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
