import { DashboardMenu, PATLogo, ProfileAvatar } from "@/components";
import { Link } from "@/routing";

const DashboardTemplate = ({ children }) => {
  return (
    <div className="w-full max-w-9xl h-screen relative bg-grey-100 flex flex-col md:flex-row text-base text-dark-10 overflow-hidden">
      <div className="w-1/2 lg:w-2/5 h-screen absolute bottom-0 right-0 bg-dashboard bg-no-repeat bg-contain bg-right-bottom" />
      <aside className="w-full 2xl:w-4/12 max-w-60 2xl:max-w-72 h-screen bg-light-1 shadow-lg flex flex-col justify-between">
        <div className="w-full h-auto lg:h-[calc(100vh-235px)] space-y-8 mt-8">
          <div className="px-4">
            <Link href="/">
              <PATLogo />
            </Link>
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
      <main className="w-full h-screen overflow-y-auto">{children}</main>
    </div>
  );
};

export default DashboardTemplate;
