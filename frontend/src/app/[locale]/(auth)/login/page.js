import { redirect } from "@/routing";
import { Alert } from "antd";
import { useTranslations } from "next-intl";

export const metadata = {
  title: "Login | PARTOS-PAT",
  description: "Make power dynamics more visible",
};

const LoginPage = ({ searchParams }) => {
  const t = useTranslations("Register");
  const { verified } = searchParams;
  return (
    <>
      {verified && (
        <Alert type="success" message={t("successVerified")} closable />
      )}
      <h1>Login page</h1>
    </>
  );
};

export default LoginPage;
