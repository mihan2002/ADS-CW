import * as React from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import { Alert, Link, LinearProgress, Stack } from "@mui/material";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { validateLoginForm } from "../utils/validation";

export default function SignIn() {
  const { user, loading, signIn, devSignIn } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authError, setAuthError] = React.useState<string | null>(null);

  if (loading) {
    return <LinearProgress />;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <Stack spacing={2}>
      {authError && <Alert severity="error">{authError}</Alert>}
      <SignInPage
        providers={[{ id: "credentials", name: "Credentials" }]}
        signIn={async (_provider, formData) => {
          try {
            const email = String(formData?.get("email") || "");
            const password = String(formData?.get("password") || "");

            // Frontend validation
            const validation = validateLoginForm({ email, password });
            if (!validation.valid) {
              const errorMessage = validation.errors.map((e) => e.message).join(", ");
              setAuthError(errorMessage);
              return { error: errorMessage };
            }

            await signIn(email, password);
            const callbackUrl = searchParams.get("callbackUrl") || "/";
            navigate(callbackUrl, { replace: true });
            return {};
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to sign in";
            setAuthError(message);
            return { error: message };
          }
        }}
      />
      <Stack direction="row" spacing={2} justifyContent="center">
        <Link
          component="button"
          onClick={() => {
            devSignIn();
            const callbackUrl = searchParams.get("callbackUrl") || "/";
            navigate(callbackUrl, { replace: true });
          }}
        >
          Dev Sign-In (Bypass Auth)
        </Link>
        <Link component="button" onClick={() => navigate("/register")}>
          Register
        </Link>
        <Link component="button" onClick={() => navigate("/forgot-password")}>
          Forgot password?
        </Link>
      </Stack>
    </Stack>
  );
}