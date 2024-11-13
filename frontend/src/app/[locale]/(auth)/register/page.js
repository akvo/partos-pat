import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { RegisterForm } from "@/components";

const RegisterPage = () => {
  const t = useTranslations("Register");

  return (
    <div className="w-full space-y-6 mb-4">
      <div className="space-y-4">
        <div className="w-full pb-3">
          <h4 className="font-bold text-lg 2xl:text-xl">{t("title")}</h4>
        </div>
        <RegisterForm />
        <div className="w-full flex gap-2 items-center justify-center text-dark-10">
          <span>{t("loginText")}</span>
          <Link href="/login">
            <span className="font-bold text-primary-dark">
              {t("loginTextLink")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
