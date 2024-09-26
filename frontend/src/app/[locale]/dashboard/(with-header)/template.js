import { BreadCrumb } from "@/components";

const WithHeaderTemplate = ({ children }) => {
  return (
    <>
      <div className="w-full h-44 flex flex-col justify-center bg-dashboard-header-gradient px-10">
        <div className="w-[420px] h-44 absolute top-0 left-[280px] bg-dashboard-circle bg-no-repeat bg-cover bg-center" />
        <BreadCrumb />
      </div>
      <main className="w-full lg:w-10/12 px-5 py-8">{children}</main>
    </>
  );
};

export default WithHeaderTemplate;
