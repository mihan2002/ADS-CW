import * as React from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";
import { resetPassword } from "../services/api/auth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = React.useState(params.get("email") || "");
  const [token, setToken] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await resetPassword(email, token, newPassword);
      setMessage("Password reset successful. Redirecting to sign in.");
      setTimeout(() => navigate("/sign-in"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    }
  };

  return (
    <Paper sx={{ maxWidth: 480, margin: "40px auto", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <TextField label="Reset OTP" value={token} onChange={(event) => setToken(event.target.value)} required />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Reset password
          </Button>
          <Button onClick={() => navigate("/sign-in")}>Back to sign in</Button>
        </Stack>
      </form>
    </Paper>
  );
}
