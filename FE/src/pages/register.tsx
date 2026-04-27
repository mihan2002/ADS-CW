import * as React from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { register } from "../services/api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      await register({ name, age: Number(age), email, password });
      setMessage("Registration successful. Please verify your email with OTP.");
      setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(email)}`), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <Paper sx={{ maxWidth: 480, margin: "40px auto", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Register
      </Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Full Name" value={name} onChange={(event) => setName(event.target.value)} required />
          <TextField label="Age" type="number" value={age} onChange={(event) => setAge(event.target.value)} required />
          <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Create account
          </Button>
          <Button onClick={() => navigate("/sign-in")}>Back to sign in</Button>
        </Stack>
      </form>
    </Paper>
  );
}
