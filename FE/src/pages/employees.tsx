import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getAlumniList, getAlumniProfile } from "../services/api/alumni";
import type { AlumniFullProfile, AlumniProfile } from "../types/api";

export default function EmployeesCrudPage() {
  const [alumni, setAlumni] = React.useState<AlumniProfile[]>([]);
  const [filtered, setFiltered] = React.useState<AlumniProfile[]>([]);
  const [search, setSearch] = React.useState("");
  const [degreeFilter, setDegreeFilter] = React.useState("all");
  const [yearFilter, setYearFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = React.useState<AlumniFullProfile | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAlumniList();
        setAlumni(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch alumni");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  React.useEffect(() => {
    const value = search.toLowerCase().trim();
    const result = alumni.filter((item) => {
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
      const matchesSearch = !value || fullName.includes(value) || (item.current_position || "").toLowerCase().includes(value);
      const matchesDegree = degreeFilter === "all" || (item.degree || "Unknown") === degreeFilter;
      const matchesYear = yearFilter === "all" || String(item.graduation_year || "Unknown") === yearFilter;
      return matchesSearch && matchesDegree && matchesYear;
    });
    setFiltered(result);
  }, [alumni, search, degreeFilter, yearFilter]);

  const uniqueDegrees = React.useMemo(
    () => Array.from(new Set(alumni.map((item) => item.degree || "Unknown"))),
    [alumni],
  );
  const uniqueYears = React.useMemo(
    () => Array.from(new Set(alumni.map((item) => String(item.graduation_year || "Unknown")))).sort(),
    [alumni],
  );

  const openProfile = async (userId: number) => {
    const fullProfile = await getAlumniProfile(userId);
    setSelectedProfile(fullProfile);
  };

  return (
    <PageContainer title="Alumni Explorer">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="Search alumni" value={search} onChange={(event) => setSearch(event.target.value)} fullWidth />
          <TextField select label="Degree" value={degreeFilter} onChange={(event) => setDegreeFilter(event.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {uniqueDegrees.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Graduation Year" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {uniqueYears.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <CircularProgress />
        ) : filtered.length === 0 ? (
          <Alert severity="info">No alumni match the selected filters.</Alert>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((item) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.user_id}>
                <Card onClick={() => openProfile(item.user_id)} sx={{ cursor: "pointer", height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6">{`${item.first_name} ${item.last_name}`}</Typography>
                    <Typography color="text.secondary">{item.current_position || "Position not available"}</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={item.degree || "Unknown degree"} size="small" />
                      <Chip label={item.graduation_year || "Unknown year"} size="small" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <Dialog open={Boolean(selectedProfile)} onClose={() => setSelectedProfile(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProfile
            ? `${selectedProfile.profile.first_name} ${selectedProfile.profile.last_name}`
            : "Alumni Profile"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedProfile && (
            <Stack spacing={2}>
              <Typography>{selectedProfile.profile.bio || "No bio available."}</Typography>
              <Typography variant="subtitle2">Employment History</Typography>
              {selectedProfile.employmentHistory.map((job) => (
                <Typography key={job.id} variant="body2">
                  {job.job_title} at {job.company}
                </Typography>
              ))}
              <Typography variant="subtitle2">Certifications</Typography>
              {selectedProfile.certifications.map((cert) => (
                <Typography key={cert.id} variant="body2">
                  {cert.name} ({cert.provider})
                </Typography>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
