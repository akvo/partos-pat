import { DashboardIcon } from "@/components/Icons";

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
    name: "faqs",
    icon: <DashboardIcon />,
    url: "/faqs",
  },
  {
    id: 3,
    name: "resources",
    icon: <DashboardIcon />,
    url: "/pat-resources",
  },
];
