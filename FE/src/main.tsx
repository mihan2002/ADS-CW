import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layouts/dashboard";
import BiddingPage from "./pages/bidding";
import DashboardPage from "./pages";
import EmployeesCrudPage from "./pages/employees";
import ForgotPasswordPage from "./pages/forgot-password";
import RegisterPage from "./pages/register";
import ResetPasswordPage from "./pages/reset-password";
import SignInPage from "./pages/signin";
import VerifyEmailPage from "./pages/verify-email";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            path: "",
            Component: DashboardPage,
          },
          {
            path: "employees/:employeeId?/*",
            Component: EmployeesCrudPage,
          },
          {
            path: "bidding",
            Component: BiddingPage,
          },
        ],
      },
      {
        path: "/sign-in",
        Component: SignInPage,
      },
      {
        path: "/register",
        Component: RegisterPage,
      },
      {
        path: "/verify-email",
        Component: VerifyEmailPage,
      },
      {
        path: "/forgot-password",
        Component: ForgotPasswordPage,
      },
      {
        path: "/reset-password",
        Component: ResetPasswordPage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);