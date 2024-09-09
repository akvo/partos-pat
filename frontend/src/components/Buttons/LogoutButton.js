"use client";

import { useRouter } from "next/navigation";
import { Button } from "antd";
import { signOut } from "@/lib/auth";
import { useTranslations } from "next-intl";

const LogoutButton = () => {
  const router = useRouter();
  const t = useTranslations("common");

  const onLogout = async () => {
    await signOut();
    router.push("/");
  };
  return (
    <Button htmlType="button" onClick={onLogout} ghost>
      {t("logout")}
    </Button>
  );
};

export default LogoutButton;
