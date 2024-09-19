"use client";

import { useUserContext } from "@/context/UserContextProvider";
import { Avatar, Space } from "antd";

const ProfileAvatar = () => {
  const userContext = useUserContext();

  const { full_name, email } = userContext;
  const [firstName, lastName] = full_name?.split(/\s/g);

  return (
    <Space>
      <Avatar
        size={48}
      >{`${firstName ? firstName[0].toUpperCase() : ""}${lastName ? lastName?.[0]?.toUpperCase() : ""}`}</Avatar>
      <div>
        <strong>{full_name}</strong>
        <p className="w-full md:w-48 overflow-x-hidden text-sm text-ellipsis">
          {email}
        </p>
      </div>
    </Space>
  );
};

export default ProfileAvatar;
