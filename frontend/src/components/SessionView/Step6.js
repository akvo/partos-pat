"use client";

import { forwardRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSessionContext } from "@/context/SessionContextProvider";
import { Avatar, List } from "antd";

const StepSix = ({ patSession }, ref) => {
  const t = useTranslations("Session");
  const sessionContext = useSessionContext();
  const { data: comments } = sessionContext?.comments || { data: [] };

  const groupByOrganization = useMemo(() => {
    const group = comments.reduce((acc, comment) => {
      const organizationName = comment?.organization_name;
      if (!acc[organizationName]) {
        acc[organizationName] = [];
      }
      acc[organizationName].push(comment);
      return acc;
    }, {});
    return Object.keys(group).map((key) => ({
      organization_name: key,
      comments: group[key],
    }));
  }, [comments]);

  return (
    <div className="w-full space-y-12 pt-6" ref={ref}>
      <div className="w-full space-y-2">
        <strong>{t("partnerComments")}</strong>
        <List
          dataSource={groupByOrganization}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{item.organization_name[0]}</Avatar>}
                title={
                  <strong className="text-base font-extra-bold">
                    {item.organization_name}
                  </strong>
                }
                description={
                  <ul className="space-y-2 pt-3">
                    {item.comments.map((comment) => (
                      <li
                        key={comment.id}
                        className="p-3 bg-[#F1F2F3E5] rounded-md text-dark-7"
                      >
                        <strong>{`${comment.fullname} :`}</strong>
                        <p>{comment.comment}</p>
                      </li>
                    ))}
                  </ul>
                }
              />
            </List.Item>
          )}
        />
      </div>
      <div className="w-full space-y-2">
        <strong>{t("notesLong")}</strong>
        <p>{patSession?.notes}</p>
      </div>
      <div className="w-full space-y-2">
        <strong>{t("summaryLong")}</strong>
        <p>{patSession?.summary}</p>
      </div>
    </div>
  );
};
export default forwardRef(StepSix);
