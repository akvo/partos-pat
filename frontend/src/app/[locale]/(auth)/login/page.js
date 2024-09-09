import { useTranslations } from "next-intl";
import { PartosLogo } from "@/components/Icons";
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
      {verified && (
        <Alert type="success" message={tr("successVerified")} closable />
      )}
      <div className="w-full flex items-center justify-center pt-4 text-dark-10">
        <Link href="/">
          <PartosLogo width={125} height={125} />
        </Link>
      </div>
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
