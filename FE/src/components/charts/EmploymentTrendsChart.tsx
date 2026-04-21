import { useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Download, Image } from 'lucide-react';
import { downloadChartAsImage } from '@/utils/chartExport';
import { exportToCSV } from '@/utils/csv';

interface Props {
  data: { year: number; newPositions: number }[];
}

export function EmploymentTrendsChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card padding="md">
      <div ref={chartRef}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-surface-100">Employment Trends</h3>
            <p className="text-xs text-surface-500 mt-0.5">New positions started per year</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => exportToCSV(data, 'employment_trends')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Export CSV">
              <Download size={14} className="text-surface-400" />
            </button>
            <button onClick={() => chartRef.current && downloadChartAsImage(chartRef.current, 'employment_trends')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Save Image">
              <Image size={14} className="text-surface-400" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="empGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
            <Area type="monotone" dataKey="newPositions" name="New Positions" stroke="#06b6d4" fill="url(#empGradient)" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
