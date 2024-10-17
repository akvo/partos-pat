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
  email: "niels@partos.nl",
  name: "Power Awareness Tool",
  address: "Ellermanstraat 18B\n1114AK Amsterdam",
  phone: "020 32 09 901",
  code: "KVK 34214586\nRSIN 813990646",
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

export const SECTOR = {
  1: "Policy coherence",
  2: "International fair agreements",
  3: "Equality, inclusion & diversity",
  4: "Human rights",
  5: "Global Citizen & Global Engagement",
  6: "Collaborate on sustainable development",
  7: "Promoting peace and stabilising conflict",
  8: "Nature, environment & climate justice",
  9: "Fair distribution & access to basic amenities",
  10: "Humanitarian emergency aid",
  0: "Other",
};

export const PAT_SESSION = {
  pageSize: 7,
  maxActiveSession: 2,
  maxPartners: 10,
  maxDecisions: 15,
  totalSteps: 6,
  maxAcronym: 16,
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
};

export const FILTER_BY_ROLE = {
  facilitated: 1,
  participated: 2,
};
