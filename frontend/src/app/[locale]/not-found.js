import { useLocale } from "next-intl";
import { redirect } from "next/navigation";

const NotFound = () => {
  const locale = useLocale();
  redirect(`/${locale}/not-found`);
};

export default NotFound;
