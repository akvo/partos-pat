import { DashboardMenu, PATLogo } from "@/components";
import { getSession } from "@/lib/auth";
import { Link } from "@/routing";
import { Avatar, Space } from "antd";
import Image from "next/image";

const DashboardTemplate = async ({ children }) => {
  const { user } = (await getSession()) || {};
  const [firstName, lastName] = user ? user.full_name?.split(/\s/g) : [];
  return (
    <div className="w-full max-w-9xl h-screen bg-grey flex flex-col md:flex-row text-base text-dark-10 overflow-y-auto lg:overflow-y-hidden">
      <aside className="w-full h-auto md:w-64 lg:w-72 md:h-screen bg-light-1 shadow-lg flex flex-col justify-between">
        <div className="w-full h-auto lg:h-[calc(100vh-235px)] space-y-8 mt-8">
          <div className="px-4">
            <PATLogo />
          </div>
          <DashboardMenu />
        </div>
        <ul className="border-t-[.5px] border-t-light-10 py-6 px-4 bg-profile-gradient">
          <li>
            <Link href="/dashboard/profile">
              <Space>
                <Avatar
                  size={48}
                >{`${firstName ? firstName[0].toUpperCase() : ""}${lastName ? lastName?.[0]?.toUpperCase() : ""}`}</Avatar>
                <div>
                  <strong>{user?.full_name}</strong>
                  <p className="w-full md:w-48 overflow-x-hidden text-sm text-ellipsis">
                    {user?.email}
                  </p>
                </div>
              </Space>
            </Link>
          </li>
        </ul>
      </aside>
      <div className="w-full md:w-4/5 px-5 py-8">{children}</div>
    </div>
  );
};

export default DashboardTemplate;
