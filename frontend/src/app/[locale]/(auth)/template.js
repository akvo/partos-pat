import Image from "next/image";
import classNames from "classnames";
import { sourceSans } from "@/app/fonts";
import { useTranslations } from "next-intl";
import { PARTOS } from "@/static/config";
import { Link } from "@/routing";
import { PartosLogo } from "@/components/Icons";

const AuthTemplate = ({ children }) => {
  const t = useTranslations("common");
  return (
    <div
      className={classNames(
        sourceSans.className,
        "w-full max-w-9xl h-screen mx-auto flex flex-col md:flex-row gap-0 overflow-y-hidden",
      )}
    >
      <div className="hidden lg:block w-full lg:w-1/2 xl:w-2/3">
        <Image
          width={800}
          height={600}
          alt="PARTOS-PAT Background"
          src="/images/bg-image-login.png"
          className="bg-light-3 object-cover object-left w-full h-screen"
        />
      </div>
      <div className="w-full lg:w-1/2 xl:w-1/3 bg-light-1 px-12 py-3 text-dark-10 overflow-y-auto">
        <div className="w-full flex items-center justify-center mb-8 text-dark-10">
          <Link href="/">
            <PartosLogo width={125} height={125} />
          </Link>
        </div>
        {children}
        <div className="w-full py-3">
          <p className="text-base text-dark-10">
            {t.rich("contactText", {
              email: () => (
                <a
                  href={`mailto:${PARTOS.email}`}
                  className="text-blue underline"
                >
                  {PARTOS.email}
                </a>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthTemplate;
