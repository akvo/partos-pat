"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import moment from "moment";
import { api } from "@/lib";
import { PrintDocument, PrintTable } from "../PrintDocument";
import { FileArrowDownIcon } from "../Icons";

const style = {
  container: {
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    color: "#000",
  },
  img: {
    width: "100%",
    height: "auto",
  },
  title: {
    fontWeight: "bold",
    color: "#164e63",
  },
};

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
      onPrint(patSession?.session_name);
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
        <div style={style.container}>
          <Image
            src="/images/partos-pat-cover.png"
            alt="Cover image"
            width={400}
            height={400}
            style={style.img}
          />
          <h1>{patSession?.session_name || "Untitled"}</h1>
          <h2>Report of the Power Awareness Session</h2>
          <div>
            <p>The session started on: {patSession?.date}</p>
            <p>
              The session ended on:{" "}
              {moment(patSession?.closed_at, "YYYY-MM-DD").format("DD-MM-YYYY")}
            </p>
            <span>
              <strong>Facilitator:</strong>
              <span>{` ${patSession?.facilitator?.full_name}`}</span>
            </span>
          </div>
          <div style={{ breakAfter: "page" }}></div>
          <h3 style={style.title}>PAT session details</h3>
          <p>Participants:</p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>Name</PrintTable.TH>
                <PrintTable.TH>Position</PrintTable.TH>
                <PrintTable.TH>Email address</PrintTable.TH>
                <PrintTable.TH>Partner organization (PO)</PrintTable.TH>
                <PrintTable.TH>Acronym (PO)</PrintTable.TH>
              </tr>
            </thead>
            <tbody>
              {participants?.map((p) => {
                return (
                  <tr key={p?.id}>
                    <PrintTable.TD>{p?.full_name}</PrintTable.TD>
                    <PrintTable.TD>{p?.role}</PrintTable.TD>
                    <PrintTable.TD>{p?.email}</PrintTable.TD>
                    <PrintTable.TD>{p?.organization_name}</PrintTable.TD>
                    <PrintTable.TD>{p?.organization_acronym}</PrintTable.TD>
                  </tr>
                );
              })}
            </tbody>
          </PrintTable>
          <p>PAT session context</p>
          <PrintTable>
            <tbody>
              <tr>
                <PrintTable.TD>{patSession?.context}</PrintTable.TD>
              </tr>
            </tbody>
          </PrintTable>
          <div style={{ breakAfter: "page" }}></div>
          <h3 style={style.title}>PAT session content</h3>
          <p>
            List of important (types of) decisions that were reflected on in
            this PAT session.
          </p>
          <PrintTable>
            <tbody>
              {decisions?.map((d) => {
                return (
                  <tr key={d?.id}>
                    <PrintTable.TD>{d?.name}</PrintTable.TD>
                  </tr>
                );
              })}
            </tbody>
          </PrintTable>
          <p>
            {`On the following decisions there was agreement on the way partner organizations (PO) are/have been involved in the decision-making process.`}
          </p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>(Types of) Decisions</PrintTable.TH>
                {patSession?.organizations?.map((o) => {
                  return (
                    <PrintTable.TH key={o?.id}>{o?.acronym}</PrintTable.TH>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {decisions
                ?.filter((d) => d?.agree)
                ?.map((d) => {
                  return (
                    <tr key={d?.id}>
                      <PrintTable.TD>{d?.name}</PrintTable.TD>
                      {patSession?.organizations?.map((o) => {
                        const actualValue = d?.scores?.find(
                          (s) => s?.organization_id === o?.id,
                        );
                        return (
                          <PrintTable.TD key={`${d?.id}-${o?.id}`}>
                            {actualValue?.score}
                          </PrintTable.TD>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </PrintTable>
          <p>
            {`On the following decisions there was no agreement on the way partner organizations PO) are/have been involved in the decision-making process.`}
          </p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>(Types of) Decisions</PrintTable.TH>
                {patSession?.organizations?.map((o) => {
                  return (
                    <PrintTable.TH key={o?.id}>{o?.acronym}</PrintTable.TH>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {decisions
                ?.filter((d) => !d?.agree)
                ?.map((d) => {
                  return (
                    <tr key={d?.id}>
                      <PrintTable.TD>{d?.name}</PrintTable.TD>
                      {patSession?.organizations?.map((o) => {
                        const actualValue = d?.scores?.find(
                          (s) =>
                            s?.organization_id === o?.id &&
                            s?.desired === false,
                        );
                        return (
                          <PrintTable.TD key={`${d?.id}-${o?.id}`}>
                            {actualValue?.score}
                          </PrintTable.TD>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </PrintTable>
          <br />
          {patSession?.notes?.length > 0 && (
            <div>
              <p>
                Notes on decision-making processes on which there was no
                agreement.
              </p>
              <PrintTable>
                <tbody>
                  <tr>
                    <PrintTable.TD>{patSession.notes}</PrintTable.TD>
                  </tr>
                </tbody>
              </PrintTable>
            </div>
          )}
          <br />
          <p>
            {`After discussion, participants agreed that in these decisions partner organisations need to be involved in a different way. The desired level of participation for partner organisations is indicated in the table below:`}
          </p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>(Types of) Decisions</PrintTable.TH>
                {patSession?.organizations?.map((o) => {
                  return (
                    <PrintTable.TH key={o?.id}>{o?.acronym}</PrintTable.TH>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {decisions?.map((d) => {
                return (
                  <tr key={d?.id}>
                    <PrintTable.TD>{d?.name}</PrintTable.TD>
                    {patSession?.organizations?.map((o) => {
                      const actualValue = d?.scores?.find(
                        (s) =>
                          s?.organization_id === o?.id &&
                          (s?.desired === true || s?.desired === null),
                      );
                      return (
                        <PrintTable.TD key={`${d?.id}-${o?.id}`}>
                          {actualValue?.score}
                        </PrintTable.TD>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </PrintTable>
          <p>
            {`In order to achieve the desired level of participation of all partner organisations, the participants agree that the following needs to be done:`}
          </p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>(Types of) Decisions</PrintTable.TH>
                <PrintTable.TH>{`Action to be taken in order to achieve that partner organization can participate as desired.`}</PrintTable.TH>
              </tr>
            </thead>
            <tbody>
              {decisions
                ?.filter((d) => d?.notes)
                ?.map((d) => {
                  return (
                    <tr key={d?.id}>
                      <PrintTable.TD>{d?.name}</PrintTable.TD>
                      <PrintTable.TD>{d?.notes}</PrintTable.TD>
                    </tr>
                  );
                })}
            </tbody>
          </PrintTable>
          <div style={{ breakAfter: "page" }}></div>
          {patSession?.summary?.length > 0 && (
            <div>
              <p>Concluding remarks</p>
              <PrintTable>
                <tbody>
                  <tr>
                    <PrintTable.TD>{patSession.summary}</PrintTable.TD>
                  </tr>
                </tbody>
              </PrintTable>
            </div>
          )}
        </div>
      </PrintDocument.Area>
    </PrintDocument>
  );
};

export default PrintButton;
