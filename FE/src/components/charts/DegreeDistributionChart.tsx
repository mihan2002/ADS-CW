import { useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Download, Image } from 'lucide-react';
import { downloadChartAsImage } from '@/utils/chartExport';
import { exportToCSV } from '@/utils/csv';

interface Props {
  data: { name: string; value: number }[];
}

const COLORS = ['#818cf8', '#c084fc', '#f472b6', '#22d3ee', '#34d399', '#fbbf24', '#fb923c', '#a78bfa'];

export function DegreeDistributionChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card padding="md">
      <div ref={chartRef}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-surface-100">Alumni by Degree</h3>
            <p className="text-xs text-surface-500 mt-0.5">Degree distribution across alumni</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => exportToCSV(data, 'degree_distribution')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Export CSV">
              <Download size={14} className="text-surface-400" />
            </button>
            <button onClick={() => chartRef.current && downloadChartAsImage(chartRef.current, 'degree_distribution')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Save Image">
              <Image size={14} className="text-surface-400" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name"
              stroke="none" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
