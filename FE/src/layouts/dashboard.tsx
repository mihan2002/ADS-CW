import * as React from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { Account } from "@toolpad/core/Account";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

function CustomActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ThemeSwitcher />
      <Account
        slotProps={{
          preview: { slotProps: { avatarIconButton: { sx: { border: '0' } } } },
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <LinearProgress />
      </div>
    );
  }

  if (!user) {
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <DashboardLayout  slots={{ toolbarActions: CustomActions }}>
      <Outlet />
    </DashboardLayout>
  );
}