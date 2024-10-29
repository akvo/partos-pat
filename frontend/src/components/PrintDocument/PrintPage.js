"use client";

import Image from "next/image";
import moment from "moment";
import PrintTable from "./PrintTable";

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

const MAX_ORG_PER_PAGE = 6;

const PrintPage = ({
  patSession,
  decisions = [],
  participants = [],
  comments = [],
}) => {
  const groupedOrgPer3 = patSession?.organizations?.reduce((acc, item) => {
    const index = acc.findIndex((i) => i.length < MAX_ORG_PER_PAGE);
    if (index !== -1) {
      acc[index].push(item);
    } else {
      acc.push([item]);
    }
    return acc;
  }, []);

  const groupedComments = comments?.reduce((acc, comment) => {
    const organizationName = comment?.organization_name;
    if (!acc[organizationName]) {
      acc[organizationName] = [];
    }
    acc[organizationName].push(comment);
    return acc;
  }, {});
  const allComments = Object.keys(groupedComments).map((key) => ({
    organization_name: key,
    comments: groupedComments?.[key],
  }));

  return (
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
            <PrintTable.TH>Role</PrintTable.TH>
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
      <h3 style={style.title}>PAT session content</h3>
      <p>
        List of important (types of) decisions that were reflected on in this
        PAT session.
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
      <div style={{ breakAfter: "page" }}></div>
      {groupedOrgPer3?.map((organizations, index) => (
        <div key={index}>
          <p>
            {`On the following decisions there was agreement on the way partner organizations (PO) are/have been involved in the decision-making process.`}
          </p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>(Types of) Decisions</PrintTable.TH>
                {organizations?.map((o) => {
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
                      {organizations?.map((o) => {
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
          <div style={{ breakAfter: "page" }}></div>
        </div>
      ))}
      {groupedOrgPer3?.map((organizations, index) => (
        <div key={index}>
          <p>
            On the following decisions there was <b>no agreement</b> on the way
            partner organizations PO) are/have been involved in the
            decision-making process.
          </p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>(Types of) Decisions</PrintTable.TH>
                {organizations?.map((o) => {
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
                      {organizations?.map((o) => {
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
          <div style={{ breakAfter: "page" }}></div>
        </div>
      ))}
      <br />
      {patSession?.notes?.length > 0 && (
        <div>
          <p>
            Notes on decision-making processes on which there was no agreement.
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
      {groupedOrgPer3?.map((organizations, index) => (
        <div key={index}>
          <p>
            {`After discussion, participants agreed that in these decisions partner organisations need to be involved in a different way. The desired level of participation for partner organisations is indicated in the table below:`}
          </p>
          <PrintTable>
            <thead>
              <tr>
                <PrintTable.TH>(Types of) Decisions</PrintTable.TH>
                {organizations?.map((o) => {
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
                    {organizations?.map((o) => {
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
          <div style={{ breakAfter: "page" }}></div>
        </div>
      ))}
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
      {allComments?.length > 0 && <p>Participant Feedback Summary</p>}
      <ul style={{ marginLeft: "-24px" }}>
        {allComments?.map((c, cx) => (
          <li key={cx}>
            <div style={{ padding: "8px 0", fontSize: 14 }}>
              <strong>{c?.organization_name}</strong>
            </div>
            <PrintTable>
              <tbody>
                {c?.comments?.map((comment, index) => (
                  <tr key={index}>
                    <PrintTable.TD>
                      <strong>{comment?.fullname}</strong>
                      <br />
                      <em>{comment?.comment}</em>
                    </PrintTable.TD>
                  </tr>
                ))}
              </tbody>
            </PrintTable>
          </li>
        ))}
      </ul>
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
  );
};

export default PrintPage;
