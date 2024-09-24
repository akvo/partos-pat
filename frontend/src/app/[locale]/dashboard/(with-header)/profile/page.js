import { LogoutButton } from "@/components";
import { Card } from "antd";

const ProfilePage = () => {
  return (
    <Card>
      <div className="w-full px-5 py-3 flex justify-end">
        <LogoutButton />
      </div>
    </Card>
  );
};

export default ProfilePage;
