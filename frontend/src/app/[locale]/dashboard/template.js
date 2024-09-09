import { DashboardIcon } from "@/components/Icons";
import { Link } from "@/routing";
import { Avatar, Col, Row, Space } from "antd";
import Image from "next/image";

const DashboardTemplate = ({ children }) => {
  return (
    <div className="w-full h-screen bg-grey flex flex-col md:flex-row text-base text-dark-10 overflow-y-auto lg:overflow-y-hidden">
      <aside className="w-full md:w-72 min-h-72 md:h-screen bg-light-1 shadow-lg flex flex-col justify-between">
        <div className="w-full space-y-8 mt-12">
          <div className="w-full flex justify-center px-4">
            <Image
              width={260}
              height={55}
              alt="Power Awareness Tool Logo"
              src="https://placehold.co/260x55"
            />
          </div>
          <ul>
            <li className="p-4 bg-primary-menu font-bold">
              <Link href="/dashboard">
                <Space>
                  <DashboardIcon />
                  <span>Dashboard</span>
                </Space>
              </Link>
            </li>
          </ul>
        </div>
        <ul className="border-t-[.5px] border-t-light-10 py-6 px-4 bg-profile-gradient">
          <li>
            <Link href="/profile">
              <Space>
                <Avatar size={48}>JD</Avatar>
                <Row>
                  <Col>
                    <strong>John Doe</strong>
                    <p>john@mail.com</p>
                  </Col>
                </Row>
              </Space>
            </Link>
          </li>
        </ul>
      </aside>
      <div className="w-full md:w-4/5">{children}</div>
    </div>
  );
};

export default DashboardTemplate;
