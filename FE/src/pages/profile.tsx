import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Divider
} from "@mui/material";
import axios from "axios";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { isDevBypassEnabled } from "../utils/devMode";
import { getUserById } from "../services/api/users";
import { getAlumniProfile, createOrUpdateProfile, type CreateOrUpdateProfileData } from "../services/api/alumni";
import type { AuthUser, AlumniFullProfile } from "../types/api";
import { getAccessToken } from "../utils/tokenStorage";
import { getErrorMessage } from "../utils/errorHandler";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function ProfilePage() {
  const { user: sessionUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [me, setMe] = React.useState<AuthUser | null>(null);
  const [alumniProfile, setAlumniProfile] = React.useState<AlumniFullProfile | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateOrUpdateProfileData>({
    first_name: "",
    last_name: "",
    bio: "",
    programme: "",
    graduation_year: undefined,
    graduation_date: "",
    degree: "",
    industry_sector: "",
    geography: "",
    current_position: "",
    linkedin_url: "",
  });

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

      const token = getAccessToken();
      console.debug("[profile] load", {
        userId: sessionUser.id,
        hasToken: Boolean(token),
        path: location.pathname + location.search,
      });

      if (!token) {
        // Prevent calls when unauthenticated; let auth flow handle it.
        setLoading(false);
        setMe(null);
        navigate(`/sign-in?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
        return;
      }

      try {
        setLoading(true);
        const data = await getUserById(sessionUser.id);
        if (!alive) return;
        setMe(data);

        // Try to load alumni profile
        try {
          const profile = await getAlumniProfile(sessionUser.id);
          if (!alive) return;
          setAlumniProfile(profile);
          // Populate form with existing data
          if (profile?.profile) {
            setFormData({
              first_name: profile.profile.first_name || "",
              last_name: profile.profile.last_name || "",
              bio: profile.profile.bio || "",
              programme: profile.profile.programme || "",
              graduation_year: profile.profile.graduation_year || undefined,
              graduation_date: profile.profile.graduation_date || "",
              degree: profile.profile.degree || "",
              industry_sector: profile.profile.industry_sector || "",
              geography: profile.profile.geography || "",
              current_position: profile.profile.current_position || "",
              linkedin_url: profile.profile.linkedin_url || "",
            });
          }
        } catch (profileErr) {
          // Alumni profile doesn't exist yet, which is okay
          console.log("No alumni profile found, user can create one");
        }
      } catch (err) {
        if (!alive) return;
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 401) {
            navigate(`/sign-in?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
            return;
          }
        }
        setError(getErrorMessage(err));
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

  const handleInputChange = (field: keyof CreateOrUpdateProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === "graduation_year" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser?.id) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await createOrUpdateProfile(sessionUser.id, formData);
      setSuccess("Alumni profile saved successfully!");
      setIsEditing(false);

      // Reload the profile
      const profile = await getAlumniProfile(sessionUser.id);
      setAlumniProfile(profile);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current profile data
    if (alumniProfile?.profile) {
      setFormData({
        first_name: alumniProfile.profile.first_name || "",
        last_name: alumniProfile.profile.last_name || "",
        bio: alumniProfile.profile.bio || "",
        programme: alumniProfile.profile.programme || "",
        graduation_year: alumniProfile.profile.graduation_year || undefined,
        graduation_date: alumniProfile.profile.graduation_date || "",
        degree: alumniProfile.profile.degree || "",
        industry_sector: alumniProfile.profile.industry_sector || "",
        geography: alumniProfile.profile.geography || "",
        current_position: alumniProfile.profile.current_position || "",
        linkedin_url: alumniProfile.profile.linkedin_url || "",
      });
    }
  };

  if (!isDevBypassEnabled() && !sessionUser) {
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectTo} replace />;
  }

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
        {success && <Alert severity="success">{success}</Alert>}

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

        <Divider sx={{ my: 3 }} />

        {/* Alumni Profile Section */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {alumniProfile?.profile ? "Alumni Profile" : "Create Alumni Profile"}
                </Typography>
                {alumniProfile?.profile && !isEditing && (
                  <Button variant="outlined" onClick={handleEdit}>
                    Edit Profile
                  </Button>
                )}
              </Stack>

              {!alumniProfile?.profile && !isEditing && (
                <Alert severity="info">
                  You haven't created your alumni profile yet. Click below to get started!
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => setIsEditing(true)}>
                    Create Alumni Profile
                  </Button>
                </Alert>
              )}

              {alumniProfile?.profile && !isEditing && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>Name:</strong> {alumniProfile.profile.first_name} {alumniProfile.profile.last_name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>Position:</strong> {alumniProfile.profile.current_position || "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>Programme:</strong> {alumniProfile.profile.programme || "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>Degree:</strong> {alumniProfile.profile.degree || "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>Graduation Year:</strong> {alumniProfile.profile.graduation_year || "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>Industry:</strong> {alumniProfile.profile.industry_sector || "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>Geography:</strong> {alumniProfile.profile.geography || "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography><strong>LinkedIn:</strong> {alumniProfile.profile.linkedin_url ? <a href={alumniProfile.profile.linkedin_url} target="_blank" rel="noopener noreferrer">View Profile</a> : "-"}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography><strong>Bio:</strong></Typography>
                    <Typography color="text.secondary">{alumniProfile.profile.bio || "No bio provided"}</Typography>
                  </Grid>
                </Grid>
              )}

              {isEditing && (
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="First Name"
                          value={formData.first_name}
                          onChange={handleInputChange("first_name")}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="Last Name"
                          value={formData.last_name}
                          onChange={handleInputChange("last_name")}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Bio"
                          value={formData.bio}
                          onChange={handleInputChange("bio")}
                          placeholder="Tell us about yourself..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Programme"
                          value={formData.programme}
                          onChange={handleInputChange("programme")}
                          placeholder="e.g., Computer Science"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Degree"
                          value={formData.degree}
                          onChange={handleInputChange("degree")}
                          placeholder="e.g., Bachelor of Science"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Graduation Year"
                          value={formData.graduation_year || ""}
                          onChange={handleInputChange("graduation_year")}
                          inputProps={{ min: 1900, max: new Date().getFullYear() + 10 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Graduation Date"
                          value={formData.graduation_date}
                          onChange={handleInputChange("graduation_date")}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Current Position"
                          value={formData.current_position}
                          onChange={handleInputChange("current_position")}
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Industry Sector"
                          value={formData.industry_sector}
                          onChange={handleInputChange("industry_sector")}
                          placeholder="e.g., Technology, Finance"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Geography"
                          value={formData.geography}
                          onChange={handleInputChange("geography")}
                          placeholder="e.g., London, UK"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="url"
                          label="LinkedIn URL"
                          value={formData.linkedin_url}
                          onChange={handleInputChange("linkedin_url")}
                          placeholder="https://linkedin.com/in/your-profile"
                        />
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      {alumniProfile?.profile && (
                        <Button variant="outlined" onClick={handleCancel}>
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" variant="contained" disabled={loading}>
                        {alumniProfile?.profile ? "Save Changes" : "Create Profile"}
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
}

