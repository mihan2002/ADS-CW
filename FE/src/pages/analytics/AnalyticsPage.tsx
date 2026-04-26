import { useEffect, useState } from 'react';
import { useAlumniStore } from '@/stores/alumniStore';
import { alumniApi } from '@/services/api/alumniApi';
import { biddingApi } from '@/services/api/biddingApi';
import { useAuthStore } from '@/stores/authStore';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { GraduationYearChart } from '@/components/charts/GraduationYearChart';
import { DegreeDistributionChart } from '@/components/charts/DegreeDistributionChart';
import { CertificationsChart } from '@/components/charts/CertificationsChart';
import { EmploymentTrendsChart } from '@/components/charts/EmploymentTrendsChart';
import { TopCertificationsChart } from '@/components/charts/TopCertificationsChart';
import { BiddingActivityChart } from '@/components/charts/BiddingActivityChart';
import { AppearanceDistributionChart } from '@/components/charts/AppearanceDistributionChart';
import { TopCompaniesChart } from '@/components/charts/TopCompaniesChart';
import {
  groupByGraduationYear,
  groupByDegree,
  countCertificationsByProvider,
  analyzeEmploymentTrends,
  getTopCertifications,
  analyzeBiddingActivity,
  getAppearanceDistribution,
  getTopCompanies,
} from '@/utils/analytics';
import type { FullAlumniProfile, Bid } from '@/types';

export function AnalyticsPage() {
  const { alumni, fetchAllAlumni, isLoading } = useAlumniStore();
  const user = useAuthStore((s) => s.user);
  const [fullProfiles, setFullProfiles] = useState<FullAlumniProfile[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchAllAlumni();
  }, [fetchAllAlumni]);

  useEffect(() => {
    if (alumni.length === 0) return;
    setIsLoadingDetails(true);

    // Fetch full profiles for all alumni (batch)
    Promise.all(
      alumni.map((a) =>
        alumniApi.getAlumniProfile(a.user_id).then((r) => r.data.data).catch(() => null),
      ),
    ).then((results) => {
      setFullProfiles(results.filter(Boolean) as FullAlumniProfile[]);
      setIsLoadingDetails(false);
    });

    // Fetch bidding history for current user
    if (user?.id) {
      biddingApi.getBiddingHistory(user.id).then((r) => setBids(r.data.data)).catch(() => {});
    }
  }, [alumni, user?.id]);

  if (isLoading) return <PageSpinner />;

  if (alumni.length === 0) {
    return (
      <EmptyState
        title="No Analytics Data"
        description="Analytics will appear here once alumni profiles are available."
      />
    );
  }

  const gradYearData = groupByGraduationYear(alumni);
  const degreeData = groupByDegree(alumni);
  const certByProvider = countCertificationsByProvider(fullProfiles);
  const empTrends = analyzeEmploymentTrends(fullProfiles);
  const topCerts = getTopCertifications(fullProfiles);
  const biddingActivity = analyzeBiddingActivity(bids);
  const appearanceDist = getAppearanceDistribution(alumni);
  const topCompanies = getTopCompanies(fullProfiles);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold text-surface-100">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Comprehensive data visualizations — {alumni.length} alumni profiles analyzed
          {isLoadingDetails && ' (loading detailed data...)'}
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraduationYearChart data={gradYearData} />
        <DegreeDistributionChart data={degreeData} />
        {!isLoadingDetails && (
          <>
            <CertificationsChart data={certByProvider} />
            <EmploymentTrendsChart data={empTrends} />
            <TopCertificationsChart data={topCerts} />
            <BiddingActivityChart data={biddingActivity} />
            <AppearanceDistributionChart data={appearanceDist} />
            <TopCompaniesChart data={topCompanies} />
          </>
        )}
      </div>
    </div>
  );
}
