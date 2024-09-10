"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { signOut } from "@/lib/auth";
import { useTranslations } from "next-intl";

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("common");

  const onLogout = async () => {
    setLoading(true);
    await signOut();
    router.push("/");
  };
  return (
    <Button htmlType="button" onClick={onLogout} loading={loading} ghost>
      {t("logout")}
    </Button>
  );
};

export default LogoutButton;
