import { SessionContextProvider, UserContextProvider } from "@/context";
import { getProfile, getSession } from "@/lib/auth";

const DashboardLayout = async ({ children }) => {
  const { user } = await getSession();
  const profile = await getProfile();
  const initialValues = user
    ? { ...user, ...profile }
    : {
        id: null,
        full_name: "",
        email: "",
      };
  return (
    <UserContextProvider initialValues={initialValues}>
      <SessionContextProvider>{children}</SessionContextProvider>
    </UserContextProvider>
  );
};

export default DashboardLayout;
