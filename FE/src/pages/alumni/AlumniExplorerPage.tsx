import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAlumniStore } from '@/stores/alumniStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { searchAlumni } from '@/utils/analytics';
import { exportToCSV } from '@/utils/csv';
import { Search, Download, User, GraduationCap, Briefcase } from 'lucide-react';

export function AlumniExplorerPage() {
  const { alumni, fetchAllAlumni, isLoading } = useAlumniStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllAlumni();
  }, [fetchAllAlumni]);

  const filteredAlumni = useMemo(() => {
    let result = searchAlumni(alumni, searchQuery);
    if (degreeFilter) {
      result = result.filter((a) => a.degree === degreeFilter);
    }
    return result;
  }, [alumni, searchQuery, degreeFilter]);

  const uniqueDegrees = useMemo(
    () => [...new Set(alumni.map((a) => a.degree).filter(Boolean))] as string[],
    [alumni],
  );

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-100">
            <span className="gradient-text">Alumni Explorer</span>
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Browse and search {alumni.length} alumni profiles
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            exportToCSV(
              filteredAlumni.map((a) => ({
                Name: `${a.first_name} ${a.last_name}`,
                Degree: a.degree || 'N/A',
                GraduationYear: a.graduation_year || 'N/A',
                Position: a.current_position || 'N/A',
              })),
              'alumni_export',
            )
          }
        >
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card padding="md" hover={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"
            />
            <input
              type="text"
              placeholder="Search by name, degree, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-800/80 border border-surface-600 rounded-xl text-surface-100 placeholder-surface-500 input-focus text-sm"
              id="alumni-search"
            />
          </div>
          <select
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="px-4 py-2.5 bg-surface-800/80 border border-surface-600 rounded-xl text-surface-100 text-sm input-focus cursor-pointer min-w-[200px]"
            id="degree-filter"
          >
            <option value="">All Degrees</option>
            {uniqueDegrees.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Results */}
      {filteredAlumni.length === 0 ? (
        <EmptyState
          title="No Alumni Found"
          description="Try adjusting your search criteria or filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAlumni.map((alumnus) => (
            <Card
              key={alumnus.user_id}
              padding="md"
              className="cursor-pointer"
              onClick={() => navigate(`/alumni/${alumnus.user_id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-violet-500/30 flex items-center justify-center shrink-0">
                  <User size={22} className="text-primary-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-surface-100 truncate">
                    {alumnus.first_name} {alumnus.last_name}
                  </h3>
                  {alumnus.degree && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <GraduationCap size={13} className="text-primary-400 shrink-0" />
                      <p className="text-xs text-surface-400 truncate">{alumnus.degree}</p>
                    </div>
                  )}
                  {alumnus.current_position && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Briefcase size={13} className="text-emerald-400 shrink-0" />
                      <p className="text-xs text-surface-400 truncate">{alumnus.current_position}</p>
                    </div>
                  )}
                  {alumnus.graduation_year && (
                    <p className="text-[10px] text-surface-500 mt-1.5">
                      Class of {alumnus.graduation_year}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
