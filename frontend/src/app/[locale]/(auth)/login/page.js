import { useTranslations } from "next-intl";
import { Link } from "@/routing";
import { LoginForm } from "@/components";
import { Alert, Button } from "antd";

export const metadata = {
  title: "Login | PARTOS-PAT",
  description: "Make power dynamics more visible",
};

const LoginPage = ({ searchParams }) => {
  const t = useTranslations("Login");
  const tr = useTranslations("Register");
  const { verified } = searchParams;
  return (
    <div className="w-full h-auto space-y-6 mb-8">
      <div className="w-full pb-3">
        <h4 className="font-bold text-lg 2xl:text-xl">{t("title")}</h4>
      </div>
      {verified && (
        <Alert type="success" message={tr("successVerified")} closable />
      )}
      <LoginForm />
      <div className="mt-4">
        <Link href="/register">
          <Button htmlType="button" ghost block>
            {t("createAccount")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
