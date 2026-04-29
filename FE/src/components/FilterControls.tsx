import * as React from "react";
import { Button, Grid, MenuItem, TextField, Stack } from "@mui/material";
import { useFilters } from "../context/FilterContext";
import type { AlumniProfile } from "../types/api";

interface FilterControlsProps {
    profiles: AlumniProfile[];
}

export function FilterControls({ profiles }: FilterControlsProps) {
    const { filters, updateFilter, resetFilters } = useFilters();

    const uniqueProgrammes = React.useMemo(
        () => Array.from(new Set(profiles.map((item) => item.programme || item.degree || "Unknown"))),
        [profiles],
    );

    const uniqueIndustries = React.useMemo(
        () => Array.from(new Set(profiles.map((item) => item.industry_sector || "Unknown"))),
        [profiles],
    );

    return (
        <Stack spacing={2}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                        select
                        label="Programme"
                        value={filters.programme}
                        onChange={(e) => updateFilter("programme", e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="all">All Programmes</MenuItem>
                        {uniqueProgrammes.map((prog) => (
                            <MenuItem key={prog} value={prog}>
                                {prog}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                        select
                        label="Industry Sector"
                        value={filters.industrySector}
                        onChange={(e) => updateFilter("industrySector", e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="all">All Industries</MenuItem>
                        {uniqueIndustries.map((ind) => (
                            <MenuItem key={ind} value={ind}>
                                {ind}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                        label="Graduation From"
                        type="date"
                        value={filters.graduationFrom}
                        onChange={(e) => updateFilter("graduationFrom", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                        label="Graduation To"
                        type="date"
                        value={filters.graduationTo}
                        onChange={(e) => updateFilter("graduationTo", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                    <Button variant="outlined" onClick={resetFilters} fullWidth sx={{ height: "56px" }}>
                        Reset Filters
                    </Button>
                </Grid>
            </Grid>
        </Stack>
    );
}
