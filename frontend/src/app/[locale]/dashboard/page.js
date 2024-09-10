import { api } from "@/lib";

const HomeDashboardPage = async () => {
  const data = await api("GET", "/users/me");
  console.log("profile", data);
  return <>{/* TODO -- ADD dashboard content */}</>;
};

export default HomeDashboardPage;
