"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib";
import { PrintDocument } from "../PrintDocument";
import { FileArrowDownIcon } from "../Icons";
import { PAT_SESSION } from "@/static/config";
import PrintPage from "../PrintDocument/PrintPage";

const PrintButton = ({ patSession }) => {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [decisions, setDecisions] = useState([]);

  const t = useTranslations("Session");

  const onPrintApi = async (onPrint) => {
    setLoading(true);
    try {
      const resParticipants = await api(
        "GET",
        `/session/${patSession?.id}/participants`,
      );
      const resDecisions = await api(
        "GET",
        `/decisions/?session_id=${patSession?.id}`,
      );
      setParticipants(resParticipants);
      setDecisions(resDecisions);
      onPrint(`${PAT_SESSION.prefixFileName} ${patSession?.session_name}`);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <PrintDocument>
      <PrintDocument.Button
        type="primary"
        icon={<FileArrowDownIcon />}
        iconPosition="end"
        onClick={onPrintApi}
        loading={loading}
        block
      >
        {t("downloadPdf")}
      </PrintDocument.Button>
      <PrintDocument.Area>
        <PrintPage
          patSession={patSession}
          decisions={decisions}
          participants={participants}
        />
      </PrintDocument.Area>
    </PrintDocument>
  );
};

export default PrintButton;
