import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Alert, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { isDevBypassEnabled } from "../utils/devMode";
import { getUserById } from "../services/api/users";
import type { AuthUser } from "../types/api";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function ProfilePage() {
  const { user: sessionUser } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [me, setMe] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    let alive = true;

    async function load() {
      setError(null);

      if (isDevBypassEnabled()) {
        setLoading(false);
        setMe(null);
        return;
      }

      if (!sessionUser?.id) {
        setLoading(false);
        setMe(null);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserById(sessionUser.id);
        if (!alive) return;
        setMe(data);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [sessionUser?.id]);

  const name = me?.name ?? sessionUser?.name ?? "-";
  const email = me?.email ?? sessionUser?.email ?? "-";
  const role = me?.role ?? sessionUser?.role ?? "-";

  return (
    <PageContainer title="My Profile">
      <Stack spacing={2}>
        {isDevBypassEnabled() && (
          <Alert severity="info">
            Dev Sign-In is enabled, so this page is showing the in-app session only (no backend user record).
          </Alert>
        )}

        {loading && <LinearProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Identity
                  </Typography>
                  <Typography variant="h5">{name}</Typography>
                  <Typography color="text.secondary">{email}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`Role: ${role}`} />
                    {me?.is_email_verified !== undefined && (
                      <Chip
                        color={me.is_email_verified ? "success" : "warning"}
                        label={me.is_email_verified ? "Email verified" : "Email not verified"}
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Details
                  </Typography>
                  <Typography>
                    <strong>User ID:</strong> {me?.id ?? sessionUser?.id ?? "-"}
                  </Typography>
                  <Typography>
                    <strong>Age:</strong> {me?.age ?? "-"}
                  </Typography>
                  <Typography>
                    <strong>Last login:</strong> {formatDate(me?.last_login_at)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageContainer>
  );
}

