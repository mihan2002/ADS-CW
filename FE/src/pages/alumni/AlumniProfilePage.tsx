import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { alumniApi } from '@/services/api/alumniApi';
import { Card } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { FullAlumniProfile } from '@/types';
import {
  ArrowLeft, User, GraduationCap, Award, FileCheck, BookOpen, Briefcase,
  ExternalLink, Calendar, Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AlumniProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FullAlumniProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    alumniApi
      .getAlumniProfile(Number(userId))
      .then((res) => setProfile(res.data.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) return <PageSpinner />;
  if (!profile) return <div className="p-8 text-center text-surface-400">Profile not found</div>;

  const { profile: p, degrees, certifications, licenses, professionalCourses, employmentHistory } = profile;

  const formatDate = (d?: string) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/alumni')}>
        <ArrowLeft size={16} /> Back to Explorer
      </Button>

      {/* Header card */}
      <Card padding="lg" hover={false}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shrink-0">
            <User size={40} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-100">
              {p.first_name} {p.last_name}
            </h1>
            {p.current_position && (
              <p className="text-base text-primary-400 mt-1">{p.current_position}</p>
            )}
            {p.degree && (
              <p className="text-sm text-surface-400 mt-0.5">{p.degree}</p>
            )}
            {p.bio && (
              <p className="text-sm text-surface-400 mt-3 leading-relaxed">{p.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              {p.graduation_year && (
                <span className="inline-flex items-center gap-1.5 text-xs text-surface-400 bg-surface-800 px-3 py-1 rounded-full">
                  <Calendar size={12} /> Class of {p.graduation_year}
                </span>
              )}
              {p.appearance_count !== undefined && p.appearance_count > 0 && (
                <Badge status="active" className="text-xs" />
              )}
              {p.linkedin_url && (
                <a
                  href={p.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full hover:bg-primary-500/20 transition-colors"
                >
                  <Link2 size={12} /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Degrees */}
      {degrees.length > 0 && (
        <Card padding="md" hover={false}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100 mb-4">
            <GraduationCap size={20} className="text-primary-400" /> Degrees ({degrees.length})
          </h2>
          <div className="space-y-3">
            {degrees.map((d) => (
              <div key={d.id} className="p-3 bg-surface-800/50 rounded-xl border border-surface-700">
                <p className="text-sm font-medium text-surface-200">{d.title}</p>
                <p className="text-xs text-surface-400 mt-0.5">{d.institution_name}</p>
                <div className="flex items-center gap-3 mt-1">
                  {d.completed_on && <p className="text-xs text-surface-500">Completed: {formatDate(d.completed_on)}</p>}
                  {d.official_url && (
                    <a href={d.official_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                      <ExternalLink size={10} /> View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Card padding="md" hover={false}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100 mb-4">
            <Award size={20} className="text-emerald-400" /> Certifications ({certifications.length})
          </h2>
          <div className="space-y-3">
            {certifications.map((c) => (
              <div key={c.id} className="p-3 bg-surface-800/50 rounded-xl border border-surface-700">
                <p className="text-sm font-medium text-surface-200">{c.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">{c.provider}</p>
                <div className="flex items-center gap-3 mt-1">
                  {c.completed_on && <p className="text-xs text-surface-500">Completed: {formatDate(c.completed_on)}</p>}
                  {c.course_url && (
                    <a href={c.course_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                      <ExternalLink size={10} /> View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Licenses */}
      {licenses.length > 0 && (
        <Card padding="md" hover={false}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100 mb-4">
            <FileCheck size={20} className="text-amber-400" /> Licenses ({licenses.length})
          </h2>
          <div className="space-y-3">
            {licenses.map((l) => (
              <div key={l.id} className="p-3 bg-surface-800/50 rounded-xl border border-surface-700">
                <p className="text-sm font-medium text-surface-200">{l.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">{l.awarding_body}</p>
                <div className="flex items-center gap-3 mt-1">
                  {l.completed_on && <p className="text-xs text-surface-500">Completed: {formatDate(l.completed_on)}</p>}
                  {l.license_url && (
                    <a href={l.license_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                      <ExternalLink size={10} /> View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Professional Courses */}
      {professionalCourses.length > 0 && (
        <Card padding="md" hover={false}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100 mb-4">
            <BookOpen size={20} className="text-cyan-400" /> Professional Courses ({professionalCourses.length})
          </h2>
          <div className="space-y-3">
            {professionalCourses.map((c) => (
              <div key={c.id} className="p-3 bg-surface-800/50 rounded-xl border border-surface-700">
                <p className="text-sm font-medium text-surface-200">{c.title}</p>
                <p className="text-xs text-surface-400 mt-0.5">{c.provider}</p>
                <div className="flex items-center gap-3 mt-1">
                  {c.completed_on && <p className="text-xs text-surface-500">Completed: {formatDate(c.completed_on)}</p>}
                  {c.course_url && (
                    <a href={c.course_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                      <ExternalLink size={10} /> View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Employment History */}
      {employmentHistory.length > 0 && (
        <Card padding="md" hover={false}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-surface-100 mb-4">
            <Briefcase size={20} className="text-violet-400" /> Employment History ({employmentHistory.length})
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-surface-700" />
            <div className="space-y-4">
              {employmentHistory.map((e) => (
                <div key={e.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-violet-400 border-2 border-surface-900" />
                  <div className="p-3 bg-surface-800/50 rounded-xl border border-surface-700">
                    <p className="text-sm font-medium text-surface-200">{e.job_title}</p>
                    <p className="text-xs text-primary-400 mt-0.5">{e.company}</p>
                    <p className="text-xs text-surface-500 mt-1">
                      {formatDate(e.start_date)} — {e.end_date ? formatDate(e.end_date) : 'Present'}
                    </p>
                    {e.description && (
                      <p className="text-xs text-surface-400 mt-2 leading-relaxed">{e.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
