import { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Download, Image } from 'lucide-react';
import { downloadChartAsImage } from '@/utils/chartExport';
import { exportToCSV } from '@/utils/csv';

interface Props {
  data: { provider: string; count: number }[];
}

export function CertificationsChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card padding="md">
      <div ref={chartRef}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-surface-100">Certifications by Provider</h3>
            <p className="text-xs text-surface-500 mt-0.5">Top certification providers</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => exportToCSV(data, 'certifications')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Export CSV">
              <Download size={14} className="text-surface-400" />
            </button>
            <button onClick={() => chartRef.current && downloadChartAsImage(chartRef.current, 'certifications')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Save Image">
              <Image size={14} className="text-surface-400" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="provider" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Bar dataKey="count" name="Certifications" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
