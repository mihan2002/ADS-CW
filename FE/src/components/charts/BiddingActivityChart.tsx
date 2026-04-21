import { useRef } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Download, Image } from 'lucide-react';
import { downloadChartAsImage } from '@/utils/chartExport';
import { exportToCSV } from '@/utils/csv';

interface Props {
  data: { date: string; count: number; totalAmount: number }[];
}

export function BiddingActivityChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card padding="md">
      <div ref={chartRef}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-surface-100">Bidding Activity</h3>
            <p className="text-xs text-surface-500 mt-0.5">Bid count and total amounts over time</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => exportToCSV(data, 'bidding_activity')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Export CSV">
              <Download size={14} className="text-surface-400" />
            </button>
            <button onClick={() => chartRef.current && downloadChartAsImage(chartRef.current, 'bidding_activity')}
              className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors cursor-pointer" title="Save Image">
              <Image size={14} className="text-surface-400" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Bar yAxisId="left" dataKey="count" name="Bid Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="totalAmount" name="Total Amount ($)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
