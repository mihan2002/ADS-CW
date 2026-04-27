import DashboardIcon from "@mui/icons-material/Dashboard";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import type { Authentication, Navigation } from "@toolpad/core/AppProvider";
import { useAuth } from "./context/AuthContext";

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "employees",
    title: "Alumni Explorer",
    icon: <PersonIcon />,
  },
  {
    segment: "bidding",
    title: "Bidding",
    icon: <GavelIcon />,
  },
];

const BRANDING = {
  title: "University Analytics Dashboard",
};

export default function App() {
  const { user, signOut } = useAuth();
  const authentication: Authentication = {
    signIn: () => {},
    signOut: async () => signOut(),
  };

  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={BRANDING}
      session={
        user
          ? {
              user: {
                name: user.name,
                email: user.email,
              },
            }
          : null
      }
      authentication={authentication}
    >
      <Outlet />
    </ReactRouterAppProvider>
  );
}