import createMiddleware from "next-intl/middleware";
import { OptimisticCheck } from "./lib/auth";

export default async function middleware(request) {
  const [, locale, ...segments] = request.nextUrl.pathname.split("/");
  const pathName = segments.join("/");
  OptimisticCheck(locale, pathName, request);

  const handleI18nRouting = createMiddleware({
    locales: ["en", "fr"],
    defaultLocale: "en",
  });
  const response = handleI18nRouting(request);
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en)/:path*"],
};
