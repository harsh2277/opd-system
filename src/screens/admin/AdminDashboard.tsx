import { Activity, CreditCard, IndianRupee, Stethoscope, TestTube2, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AdminDashboard() {
  const { tokens, doctors } = useApp();
  const activeDoctors = doctors.filter((doctor) => doctor.status === 'on-duty').length;
  const waiting = tokens.filter((token) => token.status === 'waiting').length;
  const completed = tokens.filter((token) => token.status === 'done').length;
  const labCases = tokens.filter((token) => token.labTests?.length).length;
  const pharmacyCases = tokens.filter((token) => token.prescription?.length).length;
  // Compute from line items — billingAmount only stores the consultation fee at check-in
  const revenue = tokens.reduce((sum, token) => {
    const consultation = token.isNewPatient ? 500 : 300;
    const pharmacy = (token.prescription?.length || 0) * 150;
    const lab = (token.labTests?.length || 0) * 250;
    return sum + consultation + pharmacy + lab;
  }, 0);

  const stats = [
    { label: 'Today Tokens', value: tokens.length, icon: Activity },
    { label: 'Active Doctors', value: activeDoctors, icon: Stethoscope },
    { label: 'Lab Cases', value: labCases, icon: TestTube2 },
    { label: 'Collection', value: `₹${revenue.toLocaleString('en-IN')}`, icon: IndianRupee },
  ];

  const flow = [
    ['Waiting', waiting],
    ['Completed', completed],
    ['Pharmacy', pharmacyCases],
    ['Lab', labCases],
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Dashboard</h1>
        <p className="text-sm text-[var(--neutral-500)] mt-1">Simple overview of OPD activity, departments, and collection.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--neutral-500)]">{stat.label}</p>
                <Icon size={17} className="text-[var(--brand-500)]" />
              </div>
              <p className="text-2xl font-semibold text-[var(--neutral-900)] mt-3">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[360px_1fr] gap-5">
        <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[var(--neutral-900)] mb-4">Patient Flow</h2>
          <div className="space-y-4">
            {flow.map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--neutral-600)]">{label}</span>
                  <span className="font-semibold text-[var(--neutral-900)]">{value}</span>
                </div>
                <div className="h-2 rounded bg-[var(--neutral-100)]">
                  <div className="h-2 rounded bg-[var(--brand-500)]" style={{ width: `${Math.min(100, Math.max(8, Number(value) * 16))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
          <div className="px-5 py-4 border-b border-[var(--neutral-100)] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--neutral-900)]">Doctors</h2>
            <span className="text-xs text-[var(--neutral-500)]">{doctors.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--neutral-100)]">
                  {['Doctor', 'Department', 'Queue', 'Wait', 'Status'].map((heading) => (
                    <th key={heading} className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-[var(--neutral-100)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--neutral-900)]">{doctor.name}</td>
                    <td className="px-4 py-3 text-[var(--neutral-600)]">{doctor.specialty}</td>
                    <td className="px-4 py-3 text-[var(--neutral-900)]">{doctor.queue}</td>
                    <td className="px-4 py-3 text-[var(--neutral-600)]">{doctor.avgWait} min</td>
                    <td className="px-4 py-3"><StatusPill status={doctor.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ['Users', 'Manage staff accounts', Users],
          ['Billing', 'View paid department bills', CreditCard],
          ['Reports', 'Open daily summaries', Activity],
        ].map(([title, detail, Icon]) => (
          <div key={String(title)} className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
            <Icon size={17} className="text-[var(--brand-500)]" />
            <p className="text-sm font-semibold text-[var(--neutral-900)] mt-3">{title}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-1">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const classes =
    status === 'on-duty'
      ? 'bg-[var(--success-50)] text-[var(--success-700)] border-[var(--success-100)]'
      : status === 'off-duty'
        ? 'bg-[var(--neutral-100)] text-[var(--neutral-600)] border-[var(--neutral-200)]'
        : 'bg-[var(--warning-50)] text-[var(--warning-500)] border-[var(--warning-100)]';

  return <span className={`text-xs capitalize px-2.5 py-1 rounded border ${classes}`}>{status.replace('-', ' ')}</span>;
}
