import { Download, IndianRupee, Pill, Search, TestTube2, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Token, useApp } from '../../context/AppContext';

type BillingCategory = 'All' | 'Consultation' | 'Pharmacy' | 'Lab' | 'Combined';

type BillingRow = {
  id: string;
  token: string;
  patient: string;
  mobile: string;
  category: 'Consultation' | 'Pharmacy' | 'Lab' | 'Combined';
  items: string;
  amount: number;
  method: string;
  time: string;
};


export function AdminBilling() {
  const { tokens } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BillingCategory>('All');

  const rows = useMemo(() => {
    return tokens.flatMap(createBillingRowsFromToken);
  }, [tokens]);

  const filtered = rows.filter((row) => {
    const text = `${row.token} ${row.patient} ${row.category} ${row.items}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (category === 'All' || row.category === category);
  });

  // Exclude Combined rows from totals to avoid double-counting
  const baseRows = rows.filter(r => r.category !== 'Combined');
  const total = baseRows.reduce((sum, row) => sum + row.amount, 0);
  const consultationTotal = baseRows.filter((row) => row.category === 'Consultation').reduce((sum, row) => sum + row.amount, 0);
  const labTotal = baseRows.filter((row) => row.category === 'Lab').reduce((sum, row) => sum + row.amount, 0);
  const pharmacyTotal = baseRows.filter((row) => row.category === 'Pharmacy').reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Billing</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">All bills are paid. View consultation, lab, pharmacy, and combined billing records.</p>
        </div>
        <Button size="sm"><Download size={14} />Export</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          ['Total Collection', `₹${total.toLocaleString('en-IN')}`, IndianRupee],
          ['Consultation', `₹${consultationTotal.toLocaleString('en-IN')}`, WalletCards],
          ['Lab', `₹${labTotal.toLocaleString('en-IN')}`, TestTube2],
          ['Pharmacy', `₹${pharmacyTotal.toLocaleString('en-IN')}`, Pill],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
            <Icon size={16} className="text-[var(--brand-500)]" />
            <p className="text-2xl font-semibold text-[var(--neutral-900)] mt-3">{value}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[var(--neutral-100)]">
          <div className="relative flex-1 min-w-72 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search bills..." className="pl-9 h-9 text-xs" />
          </div>
          <div className="flex items-center gap-1">
            {(['All', 'Consultation', 'Pharmacy', 'Lab', 'Combined'] as BillingCategory[]).map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`px-3 py-1.5 rounded-md text-xs ${category === item ? 'bg-[var(--neutral-900)] text-white' : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--neutral-50)] border-b border-[var(--neutral-100)]">
                {['Token', 'Patient', 'Type', 'Items', 'Amount', 'Method', 'Time'].map((heading) => (
                  <th key={heading} className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-[var(--neutral-400)]">
                    No billing records found
                  </td>
                </tr>
              )}
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-[var(--neutral-100)] last:border-0 hover:bg-[var(--neutral-50)]">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[var(--brand-700)]">{row.token}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--neutral-900)]">{row.patient}</p>
                    <p className="text-xs text-[var(--neutral-500)]">{row.mobile}</p>
                  </td>
                  <td className="px-4 py-3"><CategoryPill category={row.category} /></td>
                  <td className="px-4 py-3 text-[var(--neutral-600)]">{row.items}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--neutral-900)]">₹{row.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[var(--neutral-600)]">{row.method}</td>
                  <td className="px-4 py-3 text-[var(--neutral-600)]">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function createBillingRowsFromToken(token: Token): BillingRow[] {
  const consultation = token.isNewPatient ? 500 : 300;
  const pharmacy = (token.prescription?.length || 0) * 150;
  const lab = (token.labTests?.length || 0) * 250;
  const method = token.paymentMethod ? token.paymentMethod.toUpperCase() : 'Cash';
  const time = new Date(token.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const rows: BillingRow[] = [{
    id: `${token.id}-consultation`,
    token: token.token,
    patient: token.patient.name,
    mobile: token.patient.mobile,
    category: 'Consultation',
    items: token.isNewPatient ? 'New patient consultation' : 'Returning patient consultation',
    amount: consultation,
    method,
    time,
  }];

  if (token.prescription?.length) {
    rows.push({ id: `${token.id}-pharmacy`, token: token.token, patient: token.patient.name, mobile: token.patient.mobile, category: 'Pharmacy', items: token.prescription.map((medicine) => medicine.name).join(', '), amount: pharmacy, method, time });
  }

  if (token.labTests?.length) {
    rows.push({ id: `${token.id}-lab`, token: token.token, patient: token.patient.name, mobile: token.patient.mobile, category: 'Lab', items: token.labTests.map((test) => test.name).join(', '), amount: lab, method, time });
  }

  if (rows.length > 1) {
    rows.push({ id: `${token.id}-combined`, token: token.token, patient: token.patient.name, mobile: token.patient.mobile, category: 'Combined', items: rows.map((row) => row.category).join(', '), amount: rows.reduce((sum, row) => sum + row.amount, 0), method, time });
  }

  return rows;
}

function CategoryPill({ category }: { category: BillingRow['category'] }) {
  const classes = {
    Consultation: 'bg-[var(--brand-50)] text-[var(--brand-700)] border-[var(--brand-100)]',
    Pharmacy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Lab: 'bg-sky-50 text-sky-700 border-sky-100',
    Combined: 'bg-violet-50 text-violet-700 border-violet-100',
  };

  return <span className={`text-xs px-2.5 py-1 rounded border ${classes[category]}`}>{category}</span>;
}
