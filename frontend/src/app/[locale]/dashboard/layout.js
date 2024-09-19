import { UserContextProvider } from "@/context";
import { getSession } from "@/lib/auth";

const DashboardLayout = async ({ children }) => {
  const _session = await getSession();
  const initialValues = _session
    ? _session.user
    : {
        id: null,
        full_name: "",
        email: "",
      };
  return (
    <UserContextProvider initialValues={initialValues}>
      {children}
    </UserContextProvider>
  );
};

export default DashboardLayout;
