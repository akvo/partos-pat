import { Flex } from "antd";
import { HelpButton, PATLogo } from "@/components";
import { Link } from "@/routing";

const WithNavbarTemplate = ({ children }) => {
  return (
    <div className="w-full max-w-9xl h-screen bg-grey-100 text-base text-dark-10 overflow-y-auto lg:overflow-y-hidden">
      <div className="w-1/2 lg:w-2/5 h-screen absolute bottom-0 right-0 bg-dashboard bg-no-repeat bg-contain bg-right-bottom" />
      <div className="w-full flex items-center bg-light-1 h-24">
        <div className="container mx-auto px-4">
          <Flex className="w-full" justify="space-between" align="center">
            <Link href="/dashboard">
              <div className="text-dark-10">
                <PATLogo />
              </div>
            </Link>
            <HelpButton />
          </Flex>
        </div>
      </div>
      <main className="container mx-auto px-4">{children}</main>
    </div>
  );
};

export default WithNavbarTemplate;
