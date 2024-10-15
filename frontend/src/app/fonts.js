import { Source_Sans_3, Open_Sans, Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
});
export const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--open-sans",
});

export const sourceSansPro = localFont({
  variable: "--font-sans-pro",
  src: [
    {
      path: "../fonts/source-sans-pro/SourceSansPro-ExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-ExtraLightIt.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-LightIt.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-It.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-Semibold.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-SemiboldIt.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-Bold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-BoldIt.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-Black.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/source-sans-pro/SourceSansPro-BlackIt.otf",
      weight: "700",
      style: "italic",
    },
  ],
});
