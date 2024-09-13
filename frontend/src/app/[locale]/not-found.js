import { redirect } from "next/navigation";

const NotFound = () => {
  redirect("/en/not-found");
};

export default NotFound;
