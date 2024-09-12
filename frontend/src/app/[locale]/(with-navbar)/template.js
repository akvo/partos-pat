import { QuestionMarkIcon } from "@/components/Icons";
import { Link } from "@/routing";
import { Flex } from "antd";
import Image from "next/image";

const WithNavbarTemplate = ({ children }) => {
  return (
    <div className="w-full max-w-9xl h-screen bg-grey text-base text-dark-10 overflow-y-auto lg:overflow-y-hidden">
      <div className="w-full flex items-center bg-light-1 h-24">
        <div className="container mx-auto px-2 md:px-0">
          <Flex className="w-full" justify="space-between" align="center">
            <div>
              <Link href="/dashboard">
                <Image
                  width={260}
                  height={55}
                  alt="Power Awareness Tool Logo"
                  src="https://placehold.co/260x55"
                />
              </Link>
            </div>
            <Link href="/dashboard">
              <div className="border-2 border-[#3C3C3C] p-2 rounded-full text-dark-10">
                <QuestionMarkIcon size={24} />
              </div>
            </Link>
          </Flex>
        </div>
      </div>
      <div className="container mx-auto px-2 md:px-0">{children}</div>
    </div>
  );
};

export default WithNavbarTemplate;
