"use client";

import { useUserContext } from "@/context/UserContextProvider";
import { Avatar, Space } from "antd";
import classNames from "classnames";

const ProfileAvatar = ({ large = false }) => {
  const userContext = useUserContext();

  const { full_name, email } = userContext;
  const [firstName, lastName] = full_name ? full_name.split(/\s/g) : [];

  return (
    <Space size={large ? "large" : "small"}>
      <Avatar
        size={large ? 96 : 48}
        className="profile-avatar"
      >{`${firstName ? firstName[0].toUpperCase() : ""}${lastName ? lastName?.[0]?.toUpperCase() : ""}`}</Avatar>
      <div>
        <strong
          className={classNames({
            "text-sm xl:text-base": !large,
            "text-2xl": large,
          })}
        >
          {full_name}
        </strong>
        <p
          className={classNames(
            "w-full md:min-w-32 overflow-x-hidden text-ellipsis",
            {
              "text-sm": !large,
              "text-base": large,
            },
          )}
        >
          {email}
        </p>
      </div>
    </Space>
  );
};

export default ProfileAvatar;
