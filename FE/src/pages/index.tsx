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
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
  groupByGeography,
  groupByGraduationYear,
  groupByIndustrySector,
  skillsGapRadar,
  topEmployers,
  topJobTitles,
  topCertificationSkills,
} from "../utils/analytics";
import { downloadChartAsImage, exportElementToPdf, exportToCsv } from "../utils/export";

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
  const jobTitleData = topJobTitles(details);
  const employerData = topEmployers(details);
  const industryData = groupByIndustrySector(profiles);
  const geoData = groupByGeography(profiles);
  const skillGapData = skillsGapRadar(details);
  const appearanceData = profiles.map((profile) => ({
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    value: profile.appearance_count || 0,
  }));
  const slotData = [
    { name: "Open", value: slotStatus?.isOpen ? 1 : 0 },
    { name: "Assigned", value: slotStatus?.isOpen ? 0 : 1 },
  ];

  const downloadAllCharts = async () => {
    const charts = [
      ["chart-graduation-year", "alumni-by-graduation-year.png"],
      ["chart-degree", "alumni-by-degree.png"],
      ["chart-cert-distribution", "certifications-distribution.png"],
      ["chart-employment-trends", "employment-trends.png"],
      ["chart-top-skills", "top-skills.png"],
      ["chart-bidding-activity", "bidding-activity.png"],
      ["chart-appearance-count", "appearance-count.png"],
      ["chart-slot-status", "feature-slot-status.png"],
      ["chart-job-titles", "top-job-titles.png"],
      ["chart-employers", "top-employers.png"],
      ["chart-industry", "industry-sector.png"],
      ["chart-geography", "geography.png"],
      ["chart-skills-gap", "skills-gap.png"],
    ] as const;

    for (const [id, name] of charts) {
      // eslint-disable-next-line no-await-in-loop
      await downloadChartAsImage(id, name);
    }
  };

  return (
    <PageContainer title="University Analytics Dashboard">
      <Stack spacing={3} id="dashboard-report">
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
          <Button
            variant="outlined"
            onClick={() => exportElementToPdf({ elementId: "dashboard-report", filename: "university-analytics-report.pdf", title: "University Analytics Report" })}
          >
            Export PDF Report
          </Button>
          <Button variant="contained" onClick={() => downloadChartAsImage("chart-graduation-year", "chart-graduation-year.png")}>
            Download Graduation Chart
          </Button>
          <Button variant="contained" onClick={downloadAllCharts}>
            Download All Charts (PNG)
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent id="chart-graduation-year">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Alumni by Graduation Year</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-graduation-year", "alumni-by-graduation-year.png")}>
                    Download
                  </Button>
                </Stack>
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
              <CardContent id="chart-degree">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Alumni by Degree (Doughnut)</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-degree", "alumni-by-degree.png")}>
                    Download
                  </Button>
                </Stack>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={degreeData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60} label>
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
              <CardContent id="chart-cert-distribution">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Certifications Distribution</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-cert-distribution", "certifications-distribution.png")}>
                    Download
                  </Button>
                </Stack>
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
              <CardContent id="chart-employment-trends">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Employment Trends</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-employment-trends", "employment-trends.png")}>
                    Download
                  </Button>
                </Stack>
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
              <CardContent id="chart-top-skills">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Top Certifications / Skills</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-top-skills", "top-skills.png")}>
                    Download
                  </Button>
                </Stack>
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
              <CardContent id="chart-bidding-activity">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Bidding Activity</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-bidding-activity", "bidding-activity.png")}>
                    Download
                  </Button>
                </Stack>
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
              <CardContent id="chart-appearance-count">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Appearance Count</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-appearance-count", "appearance-count.png")}>
                    Download
                  </Button>
                </Stack>
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
              <CardContent id="chart-slot-status">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Feature Slot Status</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-slot-status", "feature-slot-status.png")}>
                    Download
                  </Button>
                </Stack>
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

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent id="chart-job-titles">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Top Job Titles</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-job-titles", "top-job-titles.png")}>
                    Download
                  </Button>
                </Stack>
                <Box height={300}>
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
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent id="chart-employers">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Top Employers</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-employers", "top-employers.png")}>
                    Download
                  </Button>
                </Stack>
                <Box height={300}>
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
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent id="chart-industry">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Industry Sector</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-industry", "industry-sector.png")}>
                    Download
                  </Button>
                </Stack>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={industryData} dataKey="value" nameKey="name" outerRadius={100} label>
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
              <CardContent id="chart-geography">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Geography</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-geography", "geography.png")}>
                    Download
                  </Button>
                </Stack>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={geoData} dataKey="value" nameKey="name" outerRadius={100} label>
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
              <CardContent id="chart-skills-gap">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Skills Gap (Radar)</Typography>
                  <Button size="small" onClick={() => downloadChartAsImage("chart-skills-gap", "skills-gap.png")}>
                    Download
                  </Button>
                </Stack>
                <Box height={360}>
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
                  Insight: Lower supply vs baseline suggests where targeted training or curriculum updates may help.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageContainer>
  );
}
