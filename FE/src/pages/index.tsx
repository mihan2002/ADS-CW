import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  biddingActivityChartData,
  certificationDistribution,
  employmentTrends,
  groupByDegree,
  groupByGraduationYear,
  topCertificationSkills,
} from "../utils/analytics";
import { downloadChartAsImage, exportToCsv } from "../utils/export";

const CHART_COLORS = ["#3f51b5", "#00bcd4", "#8bc34a", "#ff9800", "#e91e63", "#9c27b0"];

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { profiles, details, allBids, slotStatus, loading, error } = useDashboardData();

  const degreesCount = details.reduce((acc, item) => acc + item.degrees.length, 0);
  const certificationsCount = details.reduce((acc, item) => acc + item.certifications.length, 0);
  const employmentRecordsCount = details.reduce((acc, item) => acc + item.employmentHistory.length, 0);

  const gradYearData = groupByGraduationYear(profiles);
  const degreeData = groupByDegree(profiles);
  const certDistribution = certificationDistribution(details);
  const employmentData = employmentTrends(details);
  const topSkillsData = topCertificationSkills(details);
  const biddingData = biddingActivityChartData(allBids);
  const appearanceData = profiles.map((profile) => ({
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    value: profile.appearance_count || 0,
  }));
  const slotData = [
    { name: "Open", value: slotStatus?.isOpen ? 1 : 0 },
    { name: "Assigned", value: slotStatus?.isOpen ? 0 : 1 },
  ];

  return (
    <PageContainer title="University Analytics Dashboard">
      <Stack spacing={3}>
        {loading && <Typography>Loading dashboard insights...</Typography>}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <MetricCard label="Total Alumni" value={profiles.length} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <MetricCard label="Certifications Count" value={certificationsCount} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <MetricCard label="Degrees Count" value={degreesCount} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <MetricCard label="Employment Records" value={employmentRecordsCount} />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => exportToCsv("alumni_analytics.csv", profiles.map((item) => ({ ...item })))}
          >
            Export Alumni CSV
          </Button>
          <Button variant="contained" onClick={() => downloadChartAsImage("chart-graduation-year", "graduation-year.png")}>
            Download Graduation Chart
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent id="chart-graduation-year">
                <Typography variant="h6">Alumni by Graduation Year</Typography>
                <Box height={300}>
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
                <Typography variant="h6">Alumni by Degree</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={degreeData} dataKey="value" nameKey="name" outerRadius={100} label>
                        {degreeData.map((_, index) => (
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
                <Typography variant="h6">Certifications Distribution</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={certDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#00bcd4" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Employment Trends</Typography>
                <Box height={300}>
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
                <Typography variant="h6">Top Certifications / Skills</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSkillsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ff9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Bidding Activity</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={biddingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#e91e63" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Appearance Count</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appearanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#9c27b0" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Feature Slot Status</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={slotData} dataKey="value" nameKey="name" outerRadius={100} label>
                        <Cell fill="#4caf50" />
                        <Cell fill="#f44336" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Target slot date: {slotStatus?.date || "-"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageContainer>
  );
}
