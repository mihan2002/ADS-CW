import { useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Download, Image } from 'lucide-react';
import { downloadChartAsImage } from '@/utils/chartExport';
import { exportToCSV } from '@/utils/csv';

interface Props {
  data: { name: string; value: number }[];
}

const COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185', '#fbbf24', '#34d399'];

export function TopCertificationsChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card padding="md">
      <div ref={chartRef}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-surface-100">Top Certifications</h3>
            <p className="text-xs text-surface-500 mt-0.5">Most popular certifications</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => exportToCSV(data, 'top_certifications')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Export CSV">
              <Download size={14} className="text-surface-400" />
            </button>
            <button onClick={() => chartRef.current && downloadChartAsImage(chartRef.current, 'top_certifications')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Save Image">
              <Image size={14} className="text-surface-400" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
              stroke="none" paddingAngle={3}
              label={({ name, percent }: { name?: string; percent?: number }) => {
                const n = name ?? '';
                return `${n.slice(0, 15)}${n.length > 15 ? '…' : ''} ${((percent ?? 0) * 100).toFixed(0)}%`;
              }}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
