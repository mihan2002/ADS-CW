import * as React from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { requestPasswordReset } from "../services/api/auth";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await requestPasswordReset(email);
      setMessage("If the account exists, a reset OTP has been sent to the email.");
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request password reset");
    }
  };

  return (
    <Paper sx={{ maxWidth: 480, margin: "40px auto", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Forgot Password
      </Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Button type="submit" variant="contained">
            Request reset
          </Button>
          <Button onClick={() => navigate("/sign-in")}>Back to sign in</Button>
        </Stack>
      </form>
    </Paper>
  );
}
