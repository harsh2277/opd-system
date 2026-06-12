import { Download, IndianRupee, Printer, TestTube2, TrendingUp } from 'lucide-react';
import { Token } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';

export function AdminReports() {
  const { tokens, doctors } = useApp();
  const completed = tokens.filter((token) => token.status === 'done').length;
  const labCases = tokens.filter((token) => token.labTests?.length).length;
  const pharmacyCases = tokens.filter((token) => token.prescription?.length).length;
  // Compute from line items — billingAmount only stores consultation at check-in
  const revenue = tokens.reduce((sum, token) => {
    const consultation = token.isNewPatient ? 500 : 300;
    const pharmacy = (token.prescription?.length || 0) * 150;
    const lab = (token.labTests?.length || 0) * 250;
    return sum + consultation + pharmacy + lab;
  }, 0);
  const reports = [
    ['Daily OPD Summary', 'Operations', `${tokens.length} tokens`],
    ['Doctor Utilization', 'Clinical', `${doctors.length} doctors`],
    ['Collection Report', 'Finance', `₹${revenue.toLocaleString('en-IN')}`],
    ['Lab Report', 'Lab', `${labCases} cases`],
    ['Pharmacy Report', 'Pharmacy', `${pharmacyCases} cases`],
    ['Completed Visit Report', 'Operations', `${completed} visits`],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Reports</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">Clean list of OPD, finance, lab, pharmacy, and doctor reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="line" size="sm"><Printer size={14} />Print</Button>
          <Button size="sm"><Download size={14} />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          ['Tokens', tokens.length, TrendingUp],
          ['Completed', completed, TrendingUp],
          ['Lab Cases', labCases, TestTube2],
          ['Collection', `₹${revenue.toLocaleString('en-IN')}`, IndianRupee],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
            <Icon size={16} className="text-[var(--brand-500)]" />
            <p className="text-2xl font-semibold text-[var(--neutral-900)] mt-3">{value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5">
        <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
          <div className="px-5 py-4 border-b border-[var(--neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--neutral-900)]">Report List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--neutral-100)]">
                  {['Report', 'Category', 'Current Value', 'Action'].map((heading) => (
                    <th key={heading} className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(([name, category, value]) => (
                  <tr key={name} className="border-b border-[var(--neutral-100)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--neutral-900)]">{name}</td>
                    <td className="px-4 py-3 text-[var(--neutral-600)]">{category}</td>
                    <td className="px-4 py-3 text-[var(--neutral-900)] font-semibold">{value}</td>
                    <td className="px-4 py-3"><button className="text-xs font-medium text-[var(--brand-700)] hover:underline">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <VisitTrendChart tokens={tokens} />
      </div>
    </div>
  );
}

function VisitTrendChart({ tokens }: { tokens: Token[] }) {
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  // Build counts for the last 7 days (Sun=0 … Sat=6, remap to Mon-first)
  const counts = Array(7).fill(0);
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
    const dayStr = d.toISOString().split('T')[0];
    counts[6 - i] = tokens.filter(t => t.issuedAt.startsWith(dayStr)).length;
  }
  const maxCount = Math.max(...counts, 1);
  return (
    <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
      <h2 className="text-sm font-semibold text-[var(--neutral-900)] mb-1">Visit Trend</h2>
      <p className="text-[10px] text-[var(--neutral-400)] mb-4">Last 7 days — live data</p>
      <div className="flex items-end gap-2 h-48 border-b border-[var(--neutral-200)]">
        {counts.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            {count > 0 && <span className="text-[9px] font-bold text-[var(--brand-700)]">{count}</span>}
            <div
              className={`w-full rounded-t transition-all ${count > 0 ? 'bg-[var(--brand-400)]' : 'bg-[var(--neutral-100)]'}`}
              style={{ height: `${Math.max(4, (count / maxCount) * 100)}%` }}
            />
            <span className="text-[9px] text-[var(--neutral-400)]">{labels[i]}</span>
          </div>
        ))}
      </div>
      {maxCount === 1 && tokens.length === 0 && (
        <p className="text-center text-xs text-[var(--neutral-400)] mt-3">No data yet — check back after patients are registered</p>
      )}
    </div>
  );
}
