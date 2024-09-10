import { LogoutButton } from "@/components";

const ProfilePage = () => {
  return (
    <div className="w-full p-4 space-y-4">
      <div className="w-full flex items-center justify-end">
        <LogoutButton />
      </div>
    </div>
  );
};

export default ProfilePage;
