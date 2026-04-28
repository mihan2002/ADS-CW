import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import {
  Alert,
  Button,
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
  const [programmeFilter, setProgrammeFilter] = React.useState("all");
  const [industryFilter, setIndustryFilter] = React.useState("all");
  const [degreeFilter, setDegreeFilter] = React.useState("all");
  const [graduationFrom, setGraduationFrom] = React.useState("");
  const [graduationTo, setGraduationTo] = React.useState("");
  const [savedFilters, setSavedFilters] = React.useState<Array<{ name: string; value: any }>>([]);
  const [selectedSaved, setSelectedSaved] = React.useState("none");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = React.useState<AlumniFullProfile | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("ads_saved_filters");
      if (raw) setSavedFilters(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

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
      const programme = (item.programme || item.degree || "Unknown") as string;
      const industry = (item.industry_sector || "Unknown") as string;

      const matchesProgramme = programmeFilter === "all" || programme === programmeFilter;
      const matchesIndustry = industryFilter === "all" || industry === industryFilter;
      const matchesDegree = degreeFilter === "all" || (item.degree || "Unknown") === degreeFilter;

      const gradDate = item.graduation_date ? new Date(item.graduation_date) : null;
      const fromOk = !graduationFrom || (gradDate ? gradDate >= new Date(graduationFrom) : true);
      const toOk = !graduationTo || (gradDate ? gradDate <= new Date(graduationTo) : true);

      return matchesSearch && matchesProgramme && matchesIndustry && matchesDegree && fromOk && toOk;
    });
    setFiltered(result);
  }, [alumni, search, programmeFilter, industryFilter, degreeFilter, graduationFrom, graduationTo]);

  React.useEffect(() => {
    if (selectedSaved === "none") return;
    const preset = savedFilters.find((p) => p.name === selectedSaved);
    if (!preset) return;
    setSearch(preset.value.search ?? "");
    setProgrammeFilter(preset.value.programmeFilter ?? "all");
    setIndustryFilter(preset.value.industryFilter ?? "all");
    setDegreeFilter(preset.value.degreeFilter ?? "all");
    setGraduationFrom(preset.value.graduationFrom ?? "");
    setGraduationTo(preset.value.graduationTo ?? "");
  }, [selectedSaved, savedFilters]);

  const uniqueDegrees = React.useMemo(
    () => Array.from(new Set(alumni.map((item) => item.degree || "Unknown"))),
    [alumni],
  );
  const uniqueProgrammes = React.useMemo(
    () => Array.from(new Set(alumni.map((item) => item.programme || item.degree || "Unknown"))),
    [alumni],
  );
  const uniqueIndustries = React.useMemo(
    () => Array.from(new Set(alumni.map((item) => item.industry_sector || "Unknown"))),
    [alumni],
  );

  const openProfile = async (userId: number) => {
    const fullProfile = await getAlumniProfile(userId);
    setSelectedProfile(fullProfile);
  };

  const saveCurrentFilters = () => {
    const name = prompt("Name this filter preset");
    if (!name) return;
    const value = { search, programmeFilter, industryFilter, degreeFilter, graduationFrom, graduationTo };
    const next = [{ name, value }, ...savedFilters.filter((p) => p.name !== name)];
    setSavedFilters(next);
    localStorage.setItem("ads_saved_filters", JSON.stringify(next));
    setSelectedSaved(name);
  };

  const deleteSelectedPreset = () => {
    if (selectedSaved === "none") return;
    const next = savedFilters.filter((p) => p.name !== selectedSaved);
    setSavedFilters(next);
    localStorage.setItem("ads_saved_filters", JSON.stringify(next));
    setSelectedSaved("none");
  };

  return (
    <PageContainer title="Alumni Explorer">
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField label="Search alumni" value={search} onChange={(event) => setSearch(event.target.value)} fullWidth />
          <TextField select label="Programme" value={programmeFilter} onChange={(event) => setProgrammeFilter(event.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {uniqueProgrammes.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Industry sector" value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {uniqueIndustries.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Degree" value={degreeFilter} onChange={(event) => setDegreeFilter(event.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {uniqueDegrees.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Graduation from"
            type="date"
            value={graduationFrom}
            onChange={(e) => setGraduationFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Graduation to"
            type="date"
            value={graduationTo}
            onChange={(e) => setGraduationTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Saved filters"
            value={selectedSaved}
            onChange={(e) => setSelectedSaved(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="none">None</MenuItem>
            {savedFilters.map((p) => (
              <MenuItem key={p.name} value={p.name}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" onClick={saveCurrentFilters}>
              Save current filters
            </Button>
            <Button variant="text" color="error" onClick={deleteSelectedPreset} disabled={selectedSaved === "none"}>
              Delete preset
            </Button>
          </Stack>
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
