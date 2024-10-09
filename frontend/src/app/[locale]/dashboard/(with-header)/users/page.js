import { UsersTable } from "@/components";
import { api } from "@/lib";

const UsersPage = async () => {
  const { total, data } = await api("GET", "/admin/users");
  return <UsersTable total={total} initialData={data} />;
};

export default UsersPage;
