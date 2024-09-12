import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { sourceSans } from "../fonts";

export const metadata = {
  title: "PARTOS-PAT",
  description: "Make power dynamics more visible",
};

export default async function LocaleLayout({ children, params: { locale } }) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang="en">
      <body className={sourceSans.className}>
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
                    inkBarColor: "#1677ff",
                    itemActiveColor: "#0958d9",
                    itemColor: "#1e1e1e",
                    itemHoverColor: "#4096ff",
                    itemSelectedColor: "#1677ff",
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
