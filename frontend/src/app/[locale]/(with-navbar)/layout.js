import { SessionContextProvider } from "@/context";

const WithNavbarLayout = ({ children }) => {
  return <SessionContextProvider>{children}</SessionContextProvider>;
};

export default WithNavbarLayout;
