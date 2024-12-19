"use client";

import { Modal } from "antd";
import { useTranslations } from "next-intl";
import { PARTOS } from "@/static/config";

const TnCModal = ({ open, handleClose }) => {
  const t = useTranslations("TnCModal");

  return (
    <Modal
      title={
        <div className="w-full space-y-2">
          <h3 className="font-bold text-xl xl:text-2xl">{t("title")}</h3>
          <div className="w-full flex gap-1">
            <strong className="font-semibold">{t("lastUpdated")}</strong>
            <span className="font-normal text-dark-4">
              {PARTOS.TnCLastUpdate}
            </span>
          </div>
        </div>
      }
      open={open}
      onOk={handleClose}
      onCancel={handleClose}
      width={768}
      okButtonProps={{
        style: { display: "none" },
      }}
      cancelButtonProps={{
        style: { display: "none" },
      }}
      closable
    >
      <div className="w-full text-sm lg:text-base space-y-4">
        <span className="whitespace-pre-line">
          {t.rich("descriptionRich", {
            link: (token) => (
              <a href={token} target="_blank" className="text-primary-dark">
                {token}
              </a>
            ),
          })}
        </span>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc1")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc1a")}</li>
            <li>{t("tnc1b")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc2")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc2a")}</li>
            <li>{t("tnc2b")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc3")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>
              {t.rich("tnc3aRich", {
                link: (token) => (
                  <a
                    href={PARTOS.TnCLink}
                    target="_blank"
                    className="text-primary-dark"
                  >
                    {token}
                  </a>
                ),
              })}
            </li>
            <li>{t("tnc3b")}</li>
            <li>{t("tnc3c")}</li>
            <li>
              {t.rich("tnc34Rich", {
                mail: (token) => (
                  <a
                    href={`mailto:${PARTOS.email}`}
                    className="text-primary-dark"
                  >
                    {token}
                  </a>
                ),
              })}
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc4")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc4a")}</li>
            <li>{t("tnc4b")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc5")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc5a")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc6")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc6a")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc7")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc7a")}</li>
            <li>{t("tnc7b")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc8")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc8a")}</li>
            <li>
              {t.rich("tnc8bRich", {
                mail: (token) => (
                  <a
                    href={`mailto:${PARTOS.email}`}
                    className="text-primary-dark"
                  >
                    {token}
                  </a>
                ),
              })}
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc9")}</h4>
          <ul className="ml-4 space-y-1 lg:space-y-3">
            <li>{t("tnc9a")}</li>
            <li>{t("tnc9b")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-md xl:text-lg mb-1">{t("tnc10")}</h4>
          <p>{t("tnc10Desc")}</p>
          <ul>
            <li className="flex gap-1">
              <strong className="min-w-16">{t("tncEmail")}</strong>
              <span>
                {": "}
                <a
                  href={`mailto:${PARTOS.email}`}
                  className="text-primary-dark"
                >
                  {PARTOS.email}
                </a>
              </span>
            </li>
            <li className="flex gap-1">
              <strong className="min-w-16">{t("tncPhone")}</strong>
              <span>
                {": "}
                <a
                  href={`tel:${PARTOS.phoneLink}`}
                  className="text-primary-dark"
                >
                  {PARTOS.phone}
                </a>
              </span>
            </li>
            <li className="flex gap-1">
              <strong className="min-w-16">{t("tncAddress")}</strong>
              <span>{`: ${PARTOS.address}`}</span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default TnCModal;
