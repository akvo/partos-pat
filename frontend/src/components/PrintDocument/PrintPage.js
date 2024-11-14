"use client";

import Image from "next/image";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import PrintTable from "./PrintTable";
import ScoreLegend from "../SessionWizard/ScoreLegend";
import countryOptions from "../../../i18n/countries.json";

dayjs.extend(customParseFormat);

const style = {
  container: {
    fontFamily: "Open Sans, sans-serif",
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
      <h2 style={{ color: "#e68a69" }}>
        Report of the Power Awareness Session
      </h2>
      <div>
        <p>The session started on: {patSession?.date}</p>
        <p>
          The session ended on:{" "}
          {dayjs(patSession?.closed_at, "YYYY-MM-DD").format("DD-MM-YYYY")}
        </p>
        <span>
          <strong>Facilitator:</strong>
          <span>{` ${patSession?.facilitator?.full_name}`}</span>
        </span>
      </div>
      <div style={{ breakAfter: "page" }}></div>
      <h3 style={style.title}>PAT session details</h3>
      <p>
        This report contains the summary of a Power Awareness Tool (PAT) session
        in the framework of the partnership{" "}
        <strong>{patSession?.session_name}</strong>.<br />
        <br />
        The PAT session started on{" "}
        {dayjs(patSession?.date, "DD-MM-YYYY").format("dddd, MMM D YYYY")} and
        ended on{" "}
        {dayjs(patSession?.closed_at, "YYYY-MM-DD").format("dddd, MMM D YYYY")}.
        <br />
        <br />
        The purpose of this session was to have a frank and open-minded
        discussion among partner organisations about the way important decisions
        are taken and should be taken in this partnership. Read more about the
        context of the session below.
        <br />
        <br />
        The partner organisations in this session that were represented by one
        or more participants were:
      </p>
      <PrintTable>
        <thead>
          <tr>
            <PrintTable.TH>Partner organization (PO)</PrintTable.TH>
            <PrintTable.TH>Acronym (PO)</PrintTable.TH>
          </tr>
        </thead>
        <tbody>
          {patSession?.organizations?.map((o) => {
            return (
              <tr key={o?.id}>
                <PrintTable.TD>{o?.name}</PrintTable.TD>
                <PrintTable.TD>{o?.acronym}</PrintTable.TD>
              </tr>
            );
          })}
        </tbody>
      </PrintTable>
      <br />
      <PrintTable>
        <thead>
          <tr>
            <PrintTable.TH>Name</PrintTable.TH>
            <PrintTable.TH>Role</PrintTable.TH>
            <PrintTable.TH>Country</PrintTable.TH>
            <PrintTable.TH>Email address</PrintTable.TH>
            <PrintTable.TH width="100">
              Partner organization (PO) Acronym
            </PrintTable.TH>
          </tr>
        </thead>
        <tbody>
          {participants?.map((p) => {
            const fc = countryOptions.find(
              (c) => c?.["alpha-2"] === p?.country
            );
            const userCountry = fc?.name || p?.country;
            return (
              <tr key={p?.id}>
                <PrintTable.TD>{p?.full_name}</PrintTable.TD>
                <PrintTable.TD>{p?.role}</PrintTable.TD>
                <PrintTable.TD>{userCountry}</PrintTable.TD>
                <PrintTable.TD>{p?.email}</PrintTable.TD>
                <PrintTable.TD>{p?.organization_acronym}</PrintTable.TD>
              </tr>
            );
          })}
        </tbody>
      </PrintTable>
      <div style={{ paddingTop: 36, paddingBottom: 16 }}>
        <strong>PAT session context</strong>
      </div>
      <PrintTable>
        <tbody>
          <tr>
            <PrintTable.TD>{patSession?.context}</PrintTable.TD>
          </tr>
        </tbody>
      </PrintTable>
      <div style={{ breakAfter: "page" }}></div>
      <h3 style={style.title}>PAT session content</h3>
      <strong>Step 1 - List important decisions</strong>
      <p>
        As a first step in this joint analysis, each participant was asked to
        come up with at least one important decision taken in the partnership in
        the past, that they would like to be reflected on in the PAT session. If
        two or more participants came up with very similar types of decisions,
        the facilitator clustered them. This resulted in the following list of
        important (types of) decisions that were reflected on in this PAT
        session.
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
      <br />
      <div style={{ paddingTop: 24 }}>
        <strong>
          Step 2 - Determine actual level of participation in decision making
        </strong>
      </div>
      <p>
        Subsequently, for each listed decision, the actual level of
        participation in taking this decision was assessed and scored for each
        partner organisation. For this the ladder of participation in
        decision-making was used. Depending on the level of participation, the
        score ranged between 0 (not involved) and 4 (partner decides).
      </p>
      <ScoreLegend isPrint={true} />

      {groupedOrgPer3?.map((organizations, index) => (
        <div key={index}>
          <p>This exercise resulted in the following overview:</p>
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
                          (s?.desired === null || s?.desired === false)
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
        </div>
      ))}
      <div style={{ paddingTop: 24 }}>
        <strong>
          Step 3 - Reflect on the actual level of participation in decision
          making
        </strong>
      </div>
      {groupedOrgPer3?.map((organizations, index) => (
        <div key={index}>
          <p>
            As part of step 3 participants jointly reflected on the levels of
            participation. They discussed whether there was consensus in the way
            these decisions were being taken in the partnership, or not. The
            table below depicts the same table as in step 2, but this table has
            one additional column at the right, stating whether there was
            agreement, or no agreement with the way these decisions were being
            taken.
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
                <PrintTable.TH>Agree?</PrintTable.TH>
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
                          (s?.desired === null || s?.desired === false)
                      );
                      return (
                        <PrintTable.TD key={`${d?.id}-${o?.id}`}>
                          {actualValue?.score}
                        </PrintTable.TD>
                      );
                    })}
                    <PrintTable.TD>{d?.agree ? "Yes" : "No"}</PrintTable.TD>
                  </tr>
                );
              })}
            </tbody>
          </PrintTable>
        </div>
      ))}

      {groupedOrgPer3?.map((organizations, index) => (
        <div key={index}>
          <p>
            From the above overview it can be concluded that with regard to the
            following decisions there was no agreement on the way partner
            organizations (PO) are/have been involved in the decision-making
            process. This table was the starting point of step 4 of the PAT
            session.
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
                            (s?.desired === null || s?.desired === false)
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
        </div>
      ))}
      <div style={{ paddingTop: 24 }}>
        <strong>
          Step 4 - Determine the desired level of participation in decision
          making
        </strong>
      </div>
      {groupedOrgPer3?.map((organizations, index) => (
        <div key={index}>
          <p>
            With regard to all the decisions on which there was no agreement
            about the actual level of participation, participants had a
            discussion in which they tried to find a desired level of
            participation on which all partners could agree. The desired level
            of participation for partner organisations for all these decisions
            is indicated in the table below:
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
                          (s) => s?.organization_id === o?.id && s?.desired
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
        </div>
      ))}
      <br />

      <div>
        <p>
          Notes on decision-making processes on which there was no agreement.
        </p>
        <PrintTable>
          <tbody>
            <tr>
              <PrintTable.TD>
                <em>{patSession.notes}</em>
              </PrintTable.TD>
            </tr>
          </tbody>
        </PrintTable>
      </div>
      <br />
      <div style={{ paddingTop: 24 }}>
        <strong>Step 5 – Actions to be taken</strong>
      </div>

      <p>
        In the fifth and final step of the PAT exercise participants determined
        what action needs to be taken in order to get to the desired level of
        participation. Of course, this is only applicable to types of decision
        making where the desired level of participation differed from the actual
        level of participation.
      </p>
      <PrintTable>
        <thead>
          <tr>
            <PrintTable.TH width="50%">(Types of) Decisions</PrintTable.TH>
            <PrintTable.TH>
              Action to be taken in order to achieve that partner organization
              can participate as desired.
            </PrintTable.TH>
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
      <p>Participant Feedback Summary</p>
      <PrintTable>
        <tbody>
          {allComments.length ? (
            allComments?.map((c, cx) => (
              <tr key={cx}>
                <PrintTable.TD>
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
                </PrintTable.TD>
              </tr>
            ))
          ) : (
            <tr>
              <PrintTable.TD />
            </tr>
          )}
        </tbody>
      </PrintTable>

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
    </div>
  );
};

export default PrintPage;
