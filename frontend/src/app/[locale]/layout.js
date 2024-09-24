import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { sourceSansPro } from "../fonts";

export const metadata = {
  title: "PARTOS-PAT",
  description: "Make power dynamics more visible",
};

export default async function LocaleLayout({ children, params: { locale } }) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={sourceSansPro.className}>
        <NextIntlClientProvider messages={messages}>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  borderRadius: 0,
                  fontFamily: "inherit",
                  colorPrimary: "#FFD249",
                  colorLink: "#FFD249",
                },
                components: {
                  Form: {
                    itemMarginBottom: 16,
                  },
                  Tabs: {
                    inkBarColor: "#ff9c00",
                    itemActiveColor: "#ff9c00",
                    itemColor: "#8B8B8B",
                    itemHoverColor: "#D3A107",
                    itemSelectedColor: "#ff9c00",
                    titleFontSize: 16,
                    titleFontSizeLG: 20,
                    titleFontSizeSM: 16,
                  },
                },
              }}
            >
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
