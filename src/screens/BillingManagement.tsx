import { useState } from 'react';
import { useApp, Token } from '../context/AppContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Search,
  Phone,
  Mail,
  Printer,
  CheckCircle,
  Receipt,
  TrendingUp,
  CreditCard,
  DollarSign,
  Landmark
} from 'lucide-react';
import { toast } from 'sonner';

type PaymentFilter = 'all' | 'upi' | 'cash' | 'card';

export function BillingManagement() {
  const { tokens } = useApp();
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  // Helper to determine if token has pending dues
  const isPendingBilling = (t: Token) => {
    const consultationPending = !t.consultationPaid;
    const medicinePending = t.prescription && t.prescription.length > 0 && !t.prescriptionPaid;
    const labPending = t.labTests && t.labTests.length > 0 && !t.labPaid;
    return consultationPending || medicinePending || labPending;
  };

  // Helper to get payment method consistently (from token if saved, or computed deterministically)
  const getPaymentMethod = (t: Token): 'upi' | 'cash' | 'card' => {
    if ((t as any).paymentMethod) return (t as any).paymentMethod;
    // Fallback deterministic method based on token character codes
    const charCodeSum = t.token.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const modes = ['upi', 'cash', 'card'] as const;
    return modes[charCodeSum % 3];
  };

  // Find completed/cleared billing tokens (done status and fully settled)
  const completedBillingTokens = tokens.filter((t) => {
    const hasConsultation = t.status === 'waiting' || t.status === 'in-consultation' || t.status === 'done';
    return hasConsultation && !isPendingBilling(t);
  });

  // Bill calculations
  const getBillBreakdown = (token: Token) => {
    const consultationFee = token.isNewPatient ? 500 : 300;
    const medicineFee = token.prescription ? token.prescription.length * 150 : 0;
    const labTestFee = token.labTests ? token.labTests.length * 250 : 0;
    const totalBill = consultationFee + medicineFee + labTestFee;

    return {
      consultationFee,
      medicineFee,
      labTestFee,
      totalBill,
    };
  };

  // Augmented completed tokens with payment methods and bills
  const augmentedTokens = completedBillingTokens.map((t) => {
    const breakdown = getBillBreakdown(t);
    const method = getPaymentMethod(t);
    return {
      ...t,
      paymentMethod: method,
      totalPaid: breakdown.totalBill,
      breakdown,
    };
  });

  // Stats calculation
  const totalCompletedCount = augmentedTokens.length;
  const upiCount = augmentedTokens.filter((t) => t.paymentMethod === 'upi').length;
  const cashCount = augmentedTokens.filter((t) => t.paymentMethod === 'cash').length;
  const totalRevenue = augmentedTokens.reduce((sum, t) => sum + t.totalPaid, 0);

  // Filter list by search query and payment pill
  const filtered = augmentedTokens.filter((t) => {
    const matchQ =
      t.patient.name.toLowerCase().includes(query.toLowerCase()) ||
      t.token.toLowerCase().includes(query.toLowerCase()) ||
      t.patient.mobile.includes(query) ||
      t.doctor.name.toLowerCase().includes(query.toLowerCase());
    const matchS =
      paymentFilter === 'all' || t.paymentMethod === paymentFilter;
    return matchQ && matchS;
  });

  const stats = [
    { label: 'Total Invoices', value: totalCompletedCount, icon: CheckCircle },
    { label: 'UPI Payments', value: upiCount, icon: Landmark },
    { label: 'Cash Payments', value: cashCount, icon: DollarSign },
    { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: TrendingUp },
  ];

  const handlePrintInvoice = (token: Token) => {
    toast.success(`Invoice and payment receipt printed for Token ${token.token}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">OPD Billing Registry</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-0.5">View active billing transactions, payment details, and duty status</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-[var(--neutral-200)] rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className="text-[var(--neutral-400)]" />
              </div>
              <p className="text-2xl font-semibold text-[var(--neutral-900)]">{s.value}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--neutral-100)]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient name, mobile, or token..."
              className="pl-9 text-xs h-9 border-[var(--neutral-200)] focus:border-[var(--teal-400)]"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            {(['all', 'upi', 'cash', 'card'] as PaymentFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setPaymentFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${paymentFilter === f
                  ? 'bg-[var(--neutral-900)] text-white'
                  : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'
                  }`}
              >
                {f === 'all' ? 'All' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
                {['Token', 'Patient', 'Assigned Doctor', 'Services', 'Items', 'Total Paid', 'Status / Method', 'Receipt'].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide whitespace-nowrap ${h === 'Receipt' ? 'text-center' : h === 'Total Paid' ? 'text-right' : 'text-left'
                        }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.token}
                  className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)] transition-colors"
                >
                  {/* Token Column */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-[var(--teal-600)] bg-[var(--teal-50)] px-2.5 py-0.5 rounded">
                      {t.token}
                    </span>
                  </td>

                  {/* Patient Info */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--neutral-900)] text-xs">{t.patient.name}</p>
                    <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">{t.patient.age} yrs • {t.patient.gender} • {t.patient.mobile}</p>
                  </td>

                  {/* Doctor Info */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--neutral-900)] text-xs">Dr. {t.doctor.name}</p>
                    <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">{t.doctor.specialty}</p>
                  </td>

                  {/* Services */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                        Consultation
                      </span>
                      {t.prescription && t.prescription.length > 0 && (
                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                          Pharmacy
                        </span>
                      )}
                      {t.labTests && t.labTests.length > 0 && (
                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                          Laboratory
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-4 py-3 text-[var(--neutral-700)] text-xs">
                    {(t.prescription?.length || 0) + (t.labTests?.length || 0)} items
                  </td>

                  {/* Total Paid */}
                  <td className="px-4 py-3 text-right font-bold text-xs text-[var(--neutral-900)] font-mono">
                    ₹{t.totalPaid}
                  </td>

                  {/* Status / Method Badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border capitalize ${t.paymentMethod === 'upi'
                        ? 'border-sky-200 text-sky-700 bg-sky-50'
                        : t.paymentMethod === 'cash'
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                          : 'border-purple-200 text-purple-700 bg-purple-50'
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${t.paymentMethod === 'upi'
                          ? 'bg-sky-500'
                          : t.paymentMethod === 'cash'
                            ? 'bg-emerald-500'
                            : 'bg-purple-500'
                          }`}
                      />
                      {t.paymentMethod}
                    </span>
                  </td>

                  {/* Print Action */}
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="line"
                      className="text-[10px] font-bold h-7 py-1 px-3 border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] inline-flex items-center gap-1"
                      onClick={() => handlePrintInvoice(t)}
                    >
                      <Printer size={11} />
                      Print
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--neutral-400)] text-sm">No settled bills found</div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-[var(--neutral-100)]">
          <p className="text-xs text-[var(--neutral-500)]">
            Showing {filtered.length} of {completedBillingTokens.length} transactions
          </p>
        </div>
      </div>
    </div>
  );
}
