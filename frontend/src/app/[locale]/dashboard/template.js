import { DashboardMenu, PATLogo, ProfileAvatar } from "@/components";
import { Link } from "@/routing";

const DashboardTemplate = ({ children }) => {
  return (
    <div className="w-full max-w-9xl h-screen bg-grey-100 flex flex-col md:flex-row text-base text-dark-10 overflow-y-auto lg:overflow-y-hidden">
      <div className="w-1/2 lg:w-2/5 h-screen absolute bottom-0 right-0 bg-dashboard bg-no-repeat bg-contain bg-right-bottom" />
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
              <ProfileAvatar />
            </Link>
          </li>
        </ul>
      </aside>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default DashboardTemplate;
