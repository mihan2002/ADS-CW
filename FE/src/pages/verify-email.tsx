import * as React from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";
import { resendVerification, verifyEmail } from "../services/api/auth";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = React.useState(params.get("email") || "");
  const [token, setToken] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const submitVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await verifyEmail(email, token);
      setMessage("Email verified successfully. You can now sign in.");
      setTimeout(() => navigate("/sign-in"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const resendOtp = async () => {
    try {
      setError(null);
      await resendVerification(email);
      setMessage("Verification OTP resent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  };

  return (
    <Paper sx={{ maxWidth: 480, margin: "40px auto", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Verify Email (OTP)
      </Typography>
      <form onSubmit={submitVerification}>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <TextField label="6-digit OTP" value={token} onChange={(event) => setToken(event.target.value)} required />
          <Button type="submit" variant="contained">
            Verify email
          </Button>
          <Button variant="outlined" onClick={resendOtp}>
            Resend OTP
          </Button>
          <Button onClick={() => navigate("/sign-in")}>Back to sign in</Button>
        </Stack>
      </form>
    </Paper>
  );
}
