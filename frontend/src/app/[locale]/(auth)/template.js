import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { PartosLogo } from "@/components/Icons";
import { PARTOS } from "@/static/config";

const AuthTemplate = ({ children }) => {
  const t = useTranslations("common");
  return (
    <div className="w-full max-w-9xl h-screen mx-auto flex flex-col md:flex-row gap-0 overflow-y-hidden">
      <figure className="hidden lg:block w-full lg:w-5/12 xl:w-2/3 relative bg-[#efe8e3]">
        <Image
          width={800}
          height={600}
          alt="PARTOS-PAT Background"
          src="/images/bg-image-login.jpg"
          className="object-contain object-center w-full h-screen"
        />
        <figcaption className="w-full min-h-4 px-4 py-8 text-xs italic text-dark-7 absolute bottom-0 left-0 z-20 bg-[#efe8e3]">
          Illustrator Credit: Juan Dellacha – Visual illustration for Partos
          Collaborative Innovation Award winner ‘Virtual Innovation Labs –
          Innovation for Change – Latin America and Carribean’ 
        </figcaption>
      </figure>
      <div className="w-full lg:w-7/12 xl:w-1/3 bg-light-1 px-12 py-3 text-dark-10 overflow-y-auto">
        <div className="w-full flex flex-col items-center justify-center mb-12 text-dark-10">
          <Link href="/">
            <PartosLogo width={125} height={125} />
          </Link>
          <h1 className="w-fit font-bold text-xl 2xl:text-2xl">
            {PARTOS.name}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthTemplate;
