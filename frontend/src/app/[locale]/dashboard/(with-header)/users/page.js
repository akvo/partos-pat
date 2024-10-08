import { Card } from "antd";
import { UsersTable } from "@/components";
import { api } from "@/lib";

const UsersPage = async () => {
  const { total, data } = await api("GET", "/admin/users");
  return (
    <Card>
      <UsersTable total={total} initialData={data} />
    </Card>
  );
};

export default UsersPage;
