import {
  BookIcon,
  ChartPieIcon,
  DashboardIcon,
  LifebuoyIcon,
  UsersIcon,
} from "@/components/Icons";

export const GENDER = {
  male: 1,
  female: 2,
  other: 3,
};

export const PURPOSE_OF_ACCOUNT = {
  purposeOfAccount1: 1,
  purposeOfAccount2: 2,
  purposeOfAccount3: 3,
  purposeOfAccount4: 4,
  purposeOfAccount5: 5,
  purposeOfAccount6: 6,
};

export const PARTOS = {
  email: "info@partos.nl",
  name: "Power Awareness Tool",
  address: "The Hague Humanity Hub\nFluwelen Burgwal 58\n2511 CJ The Hague",
  phone: "+3120 32 09 901",
  code: "KVK 34214586\nRSIN 813990646",
  PATGuidelineLink:
    "https://www.partos.nl/wp-content/uploads/2024/04/The-Power-Awareness-Tool-2.pdf",
};

export const DASHBOARD_MENU = [
  {
    id: 1,
    name: "dashboard",
    icon: <DashboardIcon />,
    url: "/dashboard",
    isAdmin: false,
  },
  {
    id: 2,
    name: "resources",
    icon: <BookIcon />,
    url: "/dashboard/pat-resources",
    isAdmin: false,
  },
  {
    id: 3,
    name: "faqs",
    icon: <LifebuoyIcon />,
    url: "/dashboard/faqs",
    isAdmin: false,
  },
  {
    id: 5,
    name: "manageUsers",
    icon: <UsersIcon />,
    url: "/dashboard/users",
    isAdmin: true,
  },
  {
    id: 6,
    name: "statistics",
    icon: <ChartPieIcon />,
    url: "/dashboard/statistics",
    isAdmin: true,
  },
];

export const BREADCRUMB_MENU = [
  ...DASHBOARD_MENU,
  {
    id: 4,
    name: "userProfile",
    icon: null,
    url: "/dashboard/profile",
  },
];

export const SESSION_PURPOSE = {
  1: "Purpose of creation #1",
  2: "Purpose of creation #2",
  3: "Purpose of creation #3",
  4: "Purpose of creation #4",
  5: "Purpose of creation #5",
  6: "Purpose of creation #6",
  7: "Purpose of creation #7",
  8: "Purpose of creation #8",
  9: "Purpose of creation #9",
  10: "Purpose of creation #10",
  0: "Other",
};

export const PAT_SESSION = {
  pageSize: 8,
  maxActiveSession: 2,
  maxPartners: 10,
  maxDecisions: 15,
  totalSteps: 6,
  maxAcronym: 16,
  prefixFileName: "PAT session",
};

export const PAT_LANGS = [
  {
    key: "en",
    label: "EN",
    long: "English",
  },
  {
    key: "fr",
    label: "FR",
    long: "French",
  },
];

export const PAT_COLORS = {
  ACCOUNT_PURPOSE: [
    "#d9a300",
    "#dfb340",
    "#e7c264",
    "#eed184",
    "#f4dfa0",
    "#6a4e00",
  ],
  SESSION_LAST_3_YEARS: [
    ["rgba(255, 156, 0, 1)", "rgba(255, 156, 0, 0)"],
    ["rgba(217, 163, 0, 0.3)", "rgba(217, 163, 0, 1)"],
    ["rgba(247, 207, 86, 0.3)", "rgba(247, 207, 86, 1)"],
  ],
  SESSION_CATEGORY: [
    "#002f61",
    "#00476f",
    "#005d7a",
    "#00737e",
    "#00887c",
    "#009c73",
    "#2cae62",
    "#68b94c",
    "#9ec033",
    "#d0c319",
    "#ffc20e",
  ],
};

export const FILTER_BY_ROLE = {
  facilitated: 1,
  participated: 2,
};
