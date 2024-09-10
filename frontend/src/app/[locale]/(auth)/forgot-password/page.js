import { useTranslations } from "next-intl";
import { PartosLogo } from "@/components/Icons";
import { Link } from "@/routing";
import { ForgotPasswordForm } from "@/components";

const ForgotPasswordPage = () => {
  const t = useTranslations("ForgotPassword");

  return (
    <div className="w-full space-y-6 mb-4">
      <div className="space-y-4">
        <ForgotPasswordForm />
        <div className="w-full flex gap-2 items-center justify-center text-dark-10">
          <Link href="/login">
            <span className="font-bold text-primary-dark">
              {t("backToLogin")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
