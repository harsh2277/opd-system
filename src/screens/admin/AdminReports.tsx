import { Download, IndianRupee, Printer, TestTube2, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';

export function AdminReports() {
  const { tokens, doctors } = useApp();
  const completed = tokens.filter((token) => token.status === 'done').length;
  const labCases = tokens.filter((token) => token.labTests?.length).length;
  const pharmacyCases = tokens.filter((token) => token.prescription?.length).length;
  const revenue = tokens.reduce((sum, token) => sum + (token.billingAmount || (token.isNewPatient ? 500 : 300)), 0);
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

        <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--neutral-900)] mb-4">Visit Trend</h2>
          <div className="flex items-end gap-2 h-56 border-b border-[var(--neutral-200)]">
            {[62, 88, 54, 78, 96, 72, 84].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-[var(--brand-100)] rounded-t" style={{ height: `${height}%` }} />
                <span className="text-[10px] text-[var(--neutral-400)]">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
