import { SessionContextProvider, UserContextProvider } from "@/context";
import { getSession } from "@/lib/auth";

const WithNavbarLayout = async ({ children }) => {
  const _session = await getSession();
  const initialValues = _session
    ? _session.user
    : {
        id: null,
        full_name: "",
        email: "",
      };
  return (
    <SessionContextProvider>
      <UserContextProvider initialValues={initialValues}>
        {children}
      </UserContextProvider>
    </SessionContextProvider>
  );
};

export default WithNavbarLayout;
