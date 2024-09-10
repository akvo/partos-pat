import { apiGet } from "@/lib/api";

const HomeDashboardPage = async () => {
  const data = await apiGet("/users/me");
  /**
   * TODO will be removed it soon
   */
  console.log("data", data);
  return <>{/* TODO -- ADD dashboard content */}</>;
};

export default HomeDashboardPage;
