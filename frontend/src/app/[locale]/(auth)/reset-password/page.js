"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { PartosLogo } from "@/components/Icons";
import { useRouter } from "@/routing";
import { ResetPasswordForm } from "@/components";
import { Button } from "antd";

const ResetPasswordPage = ({ searchParams }) => {
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const { token } = searchParams;
  const router = useRouter();

  const t = useTranslations("ForgotPassword");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(
          `/api/v1/users/verify-password-code?token=${token}`,
        );
        if (response.ok) {
          setLoading(false);
          setIsVerified(true);
        } else {
          setLoading(false);
          setIsVerified(false);
          console.error("Failed to verify token");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setLoading(false);
        setIsVerified(false);
      }
    };

    if (token) {
      setLoading(true);
      verifyToken();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="w-full space-y-6 mb-4">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Verifying token...</h1>
        </div>
      </div>
    );
  }

  if (!token || !isVerified) {
    return (
      <div className="w-full space-y-6 mb-4">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">
            {t("invalidLinkTitle")}
          </h1>
          <p className="text-gray-600 text-center">{t("invalidLinkMessage")}</p>
          <Button
            type="primary"
            htmlType="button"
            onClick={() => router.push("/forgot-password")}
            block
          >
            {t("requestNewLink")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 mb-4">
      <div className="space-y-4">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
