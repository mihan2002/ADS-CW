import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Alert, Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  employmentTrends,
  groupByDegree,
  groupByGeography,
  groupByGraduationYear,
  groupByIndustrySector,
  skillsGapRadar,
  topEmployers,
  topJobTitles,
} from "../utils/analytics";

const CHART_COLORS = ["#3f51b5", "#00bcd4", "#8bc34a", "#ff9800", "#e91e63", "#9c27b0"];

export default function ChartsPage() {
  const { profiles, details, loading, error } = useDashboardData();

  const gradYearData = groupByGraduationYear(profiles);
  const degreeData = groupByDegree(profiles);
  const employmentData = employmentTrends(details);
  const jobTitleData = topJobTitles(details);
  const employerData = topEmployers(details);
  const industryData = groupByIndustrySector(profiles);
  const geoData = groupByGeography(profiles);
  const skillGapData = skillsGapRadar(details);

  return (
    <PageContainer title="Graphs & Charts">
      <Stack spacing={2}>
        {loading && <Typography>Loading charts...</Typography>}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Alumni by Graduation Year (Bar)</Typography>
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradYearData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3f51b5" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Alumni by Programme/Degree (Doughnut)</Typography>
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={degreeData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        innerRadius={70}
                        label
                      >
                        {degreeData.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Insight: Concentrations by programme highlight where alumni specializations are strongest.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Employment Start Trends (Line)</Typography>
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={employmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8bc34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Top Job Titles (Bar)</Typography>
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jobTitleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ff9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Insight: Helps identify dominant roles and emerging career paths among graduates.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Top Employers (Bar)</Typography>
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#00bcd4" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Insight: Indicates which employers are strongest destinations for your alumni network.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Industry Sector Distribution (Pie)</Typography>
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={industryData} dataKey="value" nameKey="name" outerRadius={110} label>
                        {industryData.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Geography Distribution (Pie)</Typography>
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={geoData} dataKey="value" nameKey="name" outerRadius={110} label>
                        {geoData.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Skills Gap (Radar)</Typography>
                <Box height={380}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillGapData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis />
                      <Tooltip />
                      <Legend />
                      <Radar name="Supply" dataKey="supply" stroke="#3f51b5" fill="#3f51b5" fillOpacity={0.3} />
                      <Radar name="Baseline demand" dataKey="demand" stroke="#e91e63" fill="#e91e63" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Insight: Baseline demand is derived from the highest observed supply among the top skills; lower supply indicates potential gaps.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageContainer>
  );
}

