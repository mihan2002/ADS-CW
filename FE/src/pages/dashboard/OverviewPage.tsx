import { useEffect, useState } from 'react';
import { useAlumniStore } from '@/stores/alumniStore';
import { useAuthStore } from '@/stores/authStore';
import { alumniApi } from '@/services/api/alumniApi';
import { StatCard } from '@/components/ui/StatCard';
import { GraduationYearChart } from '@/components/charts/GraduationYearChart';
import { DegreeDistributionChart } from '@/components/charts/DegreeDistributionChart';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  groupByGraduationYear,
  groupByDegree,
  computeOverviewStats,
} from '@/utils/analytics';
import type { FullAlumniProfile, SlotStatus } from '@/types';
import { Users, Award, BookOpen, Briefcase, CalendarCheck } from 'lucide-react';

export function OverviewPage() {
  const { alumni, fetchAllAlumni, isLoading } = useAlumniStore();
  const user = useAuthStore((s) => s.user);
  const [fullProfiles, setFullProfiles] = useState<FullAlumniProfile[]>([]);
  const [slotStatus, setSlotStatus] = useState<SlotStatus | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchAllAlumni();
    alumniApi.getTomorrowSlot().then((res) => setSlotStatus(res.data.data)).catch(() => {});
  }, [fetchAllAlumni]);

  // Fetch full profiles for deeper stats (limited to first 50 for performance)
  useEffect(() => {
    if (alumni.length === 0) return;
    setIsLoadingDetails(true);
    const profilestoFetch = alumni.slice(0, 50);
    Promise.all(
      profilestoFetch.map((a) =>
        alumniApi.getAlumniProfile(a.user_id).then((r) => r.data.data).catch(() => null),
      ),
    ).then((results) => {
      setFullProfiles(results.filter(Boolean) as FullAlumniProfile[]);
      setIsLoadingDetails(false);
    });
  }, [alumni]);

  if (isLoading) return <PageSpinner />;

  const stats = computeOverviewStats(alumni, fullProfiles);
  const gradYearData = groupByGraduationYear(alumni);
  const degreeData = groupByDegree(alumni);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-surface-100">
          Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Here's an overview of the alumni analytics platform
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={28} />}
          label="Total Alumni"
          value={stats.totalAlumni}
          color="primary"
        />
        <StatCard
          icon={<Award size={28} />}
          label="Certifications"
          value={isLoadingDetails ? '...' : stats.totalCertifications}
          color="emerald"
        />
        <StatCard
          icon={<BookOpen size={28} />}
          label="Degrees Earned"
          value={isLoadingDetails ? '...' : stats.totalDegrees}
          color="violet"
        />
        <StatCard
          icon={<Briefcase size={28} />}
          label="Employment Records"
          value={isLoadingDetails ? '...' : stats.totalEmploymentRecords}
          color="amber"
        />
      </div>

      {/* Slot Status */}
      {slotStatus && (
        <Card padding="md" hover={false}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${slotStatus.isOpen ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <CalendarCheck size={24} className={slotStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-surface-100">
                Tomorrow's Feature Slot — {slotStatus.date}
              </h3>
              <p className={`text-sm ${slotStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {slotStatus.isOpen ? '🟢 Open for bidding' : '🔴 Slot assigned'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Charts */}
      {alumni.length === 0 ? (
        <EmptyState
          title="No Alumni Data"
          description="Alumni profiles will appear here once data is available."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraduationYearChart data={gradYearData} />
          <DegreeDistributionChart data={degreeData} />
        </div>
      )}
    </div>
  );
}
