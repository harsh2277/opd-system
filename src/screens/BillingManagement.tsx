import { useState } from 'react';
import { useApp, Token } from '../context/AppContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Search,
  Printer,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Landmark,
  AlertCircle,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

type BillingTab = 'pending' | 'settled' | 'all';
type PaymentMode = 'upi' | 'cash' | 'card';

export function BillingManagement() {
  const { tokens, settleBilling } = useApp();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<BillingTab>('pending');
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<Record<string, PaymentMode>>({});

  const getBillBreakdown = (token: Token) => {
    const consultationFee = token.isNewPatient ? 500 : 300;
    const medicineFee = (token.prescription?.length || 0) * 150;
    const labTestFee = (token.labTests?.length || 0) * 250;
    return { consultationFee, medicineFee, labTestFee, total: consultationFee + medicineFee + labTestFee };
  };

  const isPending = (t: Token) => {
    const consultationPending = !t.consultationPaid;
    const medicinePending = (t.prescription?.length || 0) > 0 && !t.prescriptionPaid;
    const labPending = (t.labTests?.length || 0) > 0 && !t.labPaid;
    return consultationPending || medicinePending || labPending;
  };

  const getPendingAmount = (t: Token) => {
    const b = getBillBreakdown(t);
    let amount = 0;
    if (!t.consultationPaid) amount += b.consultationFee;
    if ((t.prescription?.length || 0) > 0 && !t.prescriptionPaid) amount += b.medicineFee;
    if ((t.labTests?.length || 0) > 0 && !t.labPaid) amount += b.labTestFee;
    return amount;
  };

  const allBillingTokens = tokens.filter(
    t => t.status === 'waiting' || t.status === 'in-consultation' || t.status === 'done'
  );

  const pendingTokens = allBillingTokens.filter(isPending);
  const settledTokens = allBillingTokens.filter(t => !isPending(t));

  const displayTokens = tab === 'pending' ? pendingTokens : tab === 'settled' ? settledTokens : allBillingTokens;

  const filtered = displayTokens.filter(t =>
    t.patient.name.toLowerCase().includes(query.toLowerCase()) ||
    t.token.toLowerCase().includes(query.toLowerCase()) ||
    t.patient.mobile.includes(query) ||
    t.doctor.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalPendingAmount = pendingTokens.reduce((sum, t) => sum + getPendingAmount(t), 0);
  const totalCollected = settledTokens.reduce((sum, t) => sum + getBillBreakdown(t).total, 0);

  const handleCollect = (t: Token) => {
    const mode = paymentMode[t.token] || 'cash';
    const b = getBillBreakdown(t);
    const hasRx = (t.prescription?.length || 0) > 0;
    const hasLab = (t.labTests?.length || 0) > 0;
    settleBilling(t.token, true, hasRx, hasLab, b.total, mode);
    toast.success(`₹${getPendingAmount(t)} collected via ${mode.toUpperCase()} for ${t.patient.name}`);
  };

  const handlePrint = (t: Token) => {
    toast.success(`Receipt printed for Token ${t.token}`);
  };

  const tabs: { key: BillingTab; label: string; count: number; color: string }[] = [
    { key: 'pending', label: 'Pending', count: pendingTokens.length, color: 'text-[var(--warning-700)]' },
    { key: 'settled', label: 'Settled', count: settledTokens.length, color: 'text-[var(--success-700)]' },
    { key: 'all', label: 'All', count: allBillingTokens.length, color: 'text-[var(--neutral-600)]' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">OPD Billing</h1>
        <p className="text-sm text-[var(--neutral-500)] mt-0.5">Collect payments and view billing history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Bills', value: pendingTokens.length, sub: `₹${totalPendingAmount} outstanding`, icon: AlertCircle, accent: 'text-[var(--warning-500)]' },
          { label: 'Total Collected', value: `₹${totalCollected.toLocaleString('en-IN')}`, sub: `${settledTokens.length} invoices`, icon: TrendingUp, accent: 'text-[var(--success-500)]' },
          { label: 'UPI Payments', value: settledTokens.filter(t => t.paymentMethod === 'upi').length, sub: 'transactions', icon: Landmark, accent: 'text-[var(--brand-500)]' },
          { label: 'Cash Payments', value: settledTokens.filter(t => t.paymentMethod === 'cash').length, sub: 'transactions', icon: DollarSign, accent: 'text-[var(--neutral-500)]' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-[var(--neutral-200)] rounded-lg px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className={s.accent} />
              </div>
              <p className="text-2xl font-semibold text-[var(--neutral-900)]">{s.value}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">{s.label}</p>
              <p className="text-[10px] text-[var(--neutral-400)] mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--neutral-100)]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient, token, mobile..."
              className="pl-9 text-xs h-9 border-[var(--neutral-200)]"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-[var(--neutral-900)] text-white'
                    : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'
                }`}
              >
                {t.label}
                <span className={`text-[10px] font-bold ${tab === t.key ? 'text-white/70' : t.color}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pending empty state with guidance */}
        {tab === 'pending' && filtered.length === 0 && !query && (
          <div className="py-16 text-center">
            <div className="w-10 h-10 bg-[var(--success-50)] border border-[var(--success-200)] rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={18} className="text-[var(--success-500)]" />
            </div>
            <p className="text-sm font-medium text-[var(--neutral-900)]">All bills settled</p>
            <p className="text-xs text-[var(--neutral-400)] mt-1">No outstanding payments — you're all caught up.</p>
          </div>
        )}

        {/* Token rows */}
        {filtered.length > 0 && (
          <div className="divide-y divide-[var(--neutral-100)]">
            {filtered.map(t => {
              const breakdown = getBillBreakdown(t);
              const pending = isPending(t);
              const pendingAmt = getPendingAmount(t);
              const isExpanded = expandedToken === t.token;
              const mode = paymentMode[t.token] || 'cash';

              return (
                <div key={t.id} className={`${pending ? 'bg-[var(--warning-50)]' : ''}`}>
                  {/* Row summary */}
                  <div
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-[var(--neutral-50)] transition-colors"
                    onClick={() => setExpandedToken(isExpanded ? null : t.token)}
                  >
                    {/* Token + status */}
                    <div className="flex items-center gap-3 min-w-[110px]">
                      <span className="font-mono text-xs font-semibold text-[var(--teal-600)] bg-[var(--teal-50)] px-2 py-0.5 rounded">
                        {t.token}
                      </span>
                      {pending ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 border border-[var(--warning-200)] text-[var(--warning-700)] bg-[var(--warning-50)] rounded">
                          Pending
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 border border-[var(--success-200)] text-[var(--success-700)] bg-[var(--success-50)] rounded">
                          Settled
                        </span>
                      )}
                    </div>

                    {/* Patient */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--neutral-900)] truncate">{t.patient.name}</p>
                      <p className="text-[10px] text-[var(--neutral-400)]">{t.patient.mobile} · {t.patient.age} yrs · {t.doctor.name}</p>
                    </div>

                    {/* Services */}
                    <div className="hidden md:flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--neutral-100)] rounded text-[var(--neutral-600)]">Consult</span>
                      {(t.prescription?.length || 0) > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-[var(--neutral-100)] rounded text-[var(--neutral-600)]">Pharmacy</span>}
                      {(t.labTests?.length || 0) > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-[var(--neutral-100)] rounded text-[var(--neutral-600)]">Lab</span>}
                    </div>

                    {/* Amount */}
                    <div className="text-right min-w-[80px]">
                      {pending ? (
                        <p className="text-sm font-bold text-[var(--warning-700)]">₹{pendingAmt} due</p>
                      ) : (
                        <p className="text-sm font-semibold text-[var(--success-700)]">₹{breakdown.total} paid</p>
                      )}
                      <p className="text-[10px] text-[var(--neutral-400)]">Total: ₹{breakdown.total}</p>
                    </div>

                    {/* Expand toggle */}
                    <div className="text-[var(--neutral-400)]">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Expanded: bill breakdown + collect payment */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 bg-white border-t border-[var(--neutral-100)]">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Bill breakdown */}
                        <div>
                          <p className="text-[10px] font-semibold text-[var(--neutral-400)] uppercase tracking-wider mb-2">Bill Breakdown</p>
                          <div className="space-y-1.5">
                            {[
                              { label: `Consultation (${t.isNewPatient ? 'New' : 'Returning'})`, amount: breakdown.consultationFee, paid: t.consultationPaid },
                              ...(breakdown.medicineFee > 0 ? [{ label: `Pharmacy (${t.prescription?.length} items)`, amount: breakdown.medicineFee, paid: t.prescriptionPaid }] : []),
                              ...(breakdown.labTestFee > 0 ? [{ label: `Lab (${t.labTests?.length} tests)`, amount: breakdown.labTestFee, paid: t.labPaid }] : []),
                            ].map(item => (
                              <div key={item.label} className="flex items-center justify-between text-xs">
                                <span className="text-[var(--neutral-600)]">{item.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-[var(--neutral-900)]">₹{item.amount}</span>
                                  {item.paid
                                    ? <CheckCircle size={12} className="text-[var(--success-500)]" />
                                    : <AlertCircle size={12} className="text-[var(--warning-500)]" />
                                  }
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center justify-between pt-2 border-t border-[var(--neutral-200)] text-sm font-bold">
                              <span>Total</span>
                              <span>₹{breakdown.total}</span>
                            </div>
                          </div>
                        </div>

                        {/* Collect payment OR print */}
                        <div>
                          {pending ? (
                            <div className="space-y-3">
                              <p className="text-[10px] font-semibold text-[var(--neutral-400)] uppercase tracking-wider">Collect ₹{pendingAmt}</p>
                              <div className="flex gap-2">
                                {(['cash', 'upi', 'card'] as PaymentMode[]).map(m => (
                                  <button
                                    key={m}
                                    onClick={() => setPaymentMode(prev => ({ ...prev, [t.token]: m }))}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-md border uppercase transition-all ${
                                      mode === m
                                        ? 'border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)]'
                                        : 'border-[var(--neutral-200)] text-[var(--neutral-600)] bg-white hover:bg-[var(--neutral-50)]'
                                    }`}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                              <Button
                                variant="primary"
                                className="w-full text-xs h-9"
                                onClick={() => handleCollect(t)}
                              >
                                <CreditCard size={13} />
                                Collect ₹{pendingAmt} via {mode.toUpperCase()}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-[10px] font-semibold text-[var(--neutral-400)] uppercase tracking-wider">Payment Receipt</p>
                              <div className="p-3 bg-[var(--success-50)] border border-[var(--success-200)] rounded-lg text-xs text-[var(--success-700)]">
                                <p className="font-semibold">Fully Settled</p>
                                <p className="mt-0.5">₹{breakdown.total} via {t.paymentMethod?.toUpperCase() || 'N/A'}</p>
                              </div>
                              <Button
                                variant="line"
                                size="sm"
                                className="w-full text-xs h-9"
                                onClick={() => handlePrint(t)}
                              >
                                <Printer size={13} />
                                Print Receipt
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && query && (
          <div className="py-16 text-center text-sm text-[var(--neutral-400)]">No results for "{query}"</div>
        )}

        <div className="px-5 py-3 border-t border-[var(--neutral-100)]">
          <p className="text-xs text-[var(--neutral-500)]">
            Showing {filtered.length} of {displayTokens.length} records
          </p>
        </div>
      </div>
    </div>
  );
}
