import createMiddleware from "next-intl/middleware";
import { OptimisticCheck } from "./lib/auth";

export default async function middleware(request) {
  const [, locale, ...segments] = request.nextUrl.pathname.split("/");
  const pathName = segments.join("/");
  const isValid = await OptimisticCheck(locale, pathName, request);

  const handleI18nRouting = createMiddleware({
    locales: ["en", "fr"],
    defaultLocale: "en",
  });
  const response = handleI18nRouting(request);

  if (!isValid) {
    response.cookies.set({
      name: "currentUser",
      value: "",
      httpOnly: true,
      expires: new Date(0),
    });
    request.nextUrl.pathname = `/${locale}/login`;
  }
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en)/:path*"],
};
