import { Flex, Space } from "antd";
import { HelpButton, LangButton, PATLogo } from "@/components";
import { Link } from "@/routing";

const WithNavbarTemplate = ({ children }) => {
  return (
    <div className="w-full max-w-9xl h-screen relative bg-grey-100 text-base text-dark-10 overflow-x-hidden overflow-y-auto">
      <div className="w-1/2 lg:w-2/5 h-screen absolute bottom-0 right-0 bg-dashboard bg-no-repeat bg-contain bg-right-bottom" />
      <div className="w-full flex items-center bg-light-1 h-24 sticky top-0 z-50">
        <div className="container mx-auto">
          <Flex className="w-full" justify="space-between" align="center">
            <Link href="/dashboard">
              <div className="text-dark-10">
                <PATLogo />
              </div>
            </Link>
            <Space size="small">
              <HelpButton />
              <LangButton inherit={false} />
            </Space>
          </Flex>
        </div>
      </div>
      <main className="w-full relative">{children}</main>
    </div>
  );
};

export default WithNavbarTemplate;
