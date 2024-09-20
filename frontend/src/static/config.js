import { BookIcon, DashboardIcon, LifebuoyIcon } from "@/components/Icons";

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
};

export const DASHBOARD_MENU = [
  {
    id: 1,
    name: "dashboard",
    icon: <DashboardIcon />,
    url: "/dashboard",
  },
  {
    id: 2,
    name: "resources",
    icon: <BookIcon />,
    url: "/dashboard/pat-resources",
  },
  {
    id: 3,
    name: "faqs",
    icon: <LifebuoyIcon />,
    url: "/dashboard/faqs",
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
};
