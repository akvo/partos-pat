import { Flex } from "antd";
import { HelpButton, PATLogo } from "@/components";
import { Link } from "@/routing";

const WithNavbarTemplate = ({ children }) => {
  return (
    <div className="w-full max-w-9xl h-screen bg-grey-100 text-base text-dark-10 overflow-y-auto lg:overflow-y-hidden">
      <div className="w-full flex items-center bg-light-1 h-24">
        <div className="container mx-auto px-2 md:px-0">
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
      <div className="container mx-auto px-2 md:px-0">{children}</div>
    </div>
  );
};

export default WithNavbarTemplate;
