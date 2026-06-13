import { useState, useEffect, useRef } from 'react';
import { useApp, Token, Medicine } from '../context/AppContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Clock, CheckCircle2, Plus, Trash2, AlertCircle, Package,
  User, ShoppingBag, Search, Pill, Bell, ArrowRight, X,
} from 'lucide-react';

/* ── Time helpers ── */
function waitingTime(sentAt?: string): string {
  if (!sentAt) return '—';
  const mins = Math.floor((Date.now() - new Date(sentAt).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function waitingColor(sentAt?: string): string {
  if (!sentAt) return 'text-[var(--neutral-400)]';
  const mins = Math.floor((Date.now() - new Date(sentAt).getTime()) / 60000);
  if (mins > 20) return 'text-[var(--error-600)] font-bold';
  if (mins > 10) return 'text-[var(--warning-600)] font-semibold';
  return 'text-[var(--success-600)]';
}

export function PharmacyDashboard() {
  const { tokens, dispensePrescription, addNotification } = useApp();

  const [selectedTokenNumber, setSelectedTokenNumber] = useState<string | null>(null);
  const [activeTab, setActiveTab]         = useState<'pending' | 'dispensed'>('pending');
  const [searchQuery, setSearchQuery]     = useState('');
  const [doctorFilter, setDoctorFilter]   = useState('All');
  const [tempMedicines, setTempMedicines] = useState<Medicine[]>([]);
  const [newMed, setNewMed]               = useState<Medicine>({ name: '', dosage: '', duration: '', instructions: '' });
  const [customBillAmount, setCustomBillAmount] = useState(0);
  const [showDispenseConfirm, setShowDispenseConfirm] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex]   = useState<number | null>(null);

  // Track which tokens are "new" (arrived since last visit) for the alert badge
  const [newTokenIds, setNewTokenIds]   = useState<Set<string>>(new Set());
  const [alertDismissed, setAlertDismissed] = useState(false);
  const prevPendingRef = useRef<string[]>([]);
  const [tick, setTick] = useState(0);

  // Refresh waiting times every 30s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Detect newly arrived prescriptions
  useEffect(() => {
    const allPendingIds = tokens
      .filter(t => t.prescription?.length && t.prescriptionStatus === 'pending')
      .map(t => t.token);

    const prev = prevPendingRef.current;
    const brandNew = allPendingIds.filter(id => !prev.includes(id));
    if (brandNew.length > 0) {
      setNewTokenIds(prev => new Set([...prev, ...brandNew]));
      setAlertDismissed(false);
    }
    prevPendingRef.current = allPendingIds;
  }, [tokens]);

  /* ── Derived lists ── */
  const allPending   = tokens.filter(t => t.prescription?.length && t.prescriptionStatus === 'pending');
  const allDispensed = tokens.filter(t => t.prescription?.length && t.prescriptionStatus === 'dispensed');
  const pendingDoctors = ['All', ...Array.from(new Set(allPending.map(t => t.doctor.name)))];

  const applyFilters = (list: Token[]) =>
    list
      .filter(t => doctorFilter === 'All' || t.doctor.name === doctorFilter)
      .filter(t => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return t.patient.name.toLowerCase().includes(q) || t.token.toLowerCase().includes(q) || t.patient.mobile.includes(q);
      })
      .sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return new Date(a.pharmacySentAt || a.issuedAt).getTime() - new Date(b.pharmacySentAt || b.issuedAt).getTime();
      });

  const pendingTokens   = applyFilters(allPending);
  const dispensedTokens = applyFilters(allDispensed);
  const selectedToken   = tokens.find(t => t.token === selectedTokenNumber);
  const newCount        = newTokenIds.size;

  /* ── Handlers ── */
  const handleSelectToken = (token: Token) => {
    setSelectedTokenNumber(token.token);
    setTempMedicines(token.prescription || []);
    setCustomBillAmount(token.billingAmount || (token.prescription || []).length * 150 + 20);
    // Mark as seen
    setNewTokenIds(prev => { const n = new Set(prev); n.delete(token.token); return n; });
  };

  const handleDispense = () => {
    if (!selectedToken) return;
    if (tempMedicines.length === 0) { toast.error('Prescription must have at least one medicine'); return; }
    setShowDispenseConfirm(true);
  };

  const confirmDispense = async () => {
    if (!selectedToken) return;
    await dispensePrescription(selectedToken.token, tempMedicines, customBillAmount);
    await addNotification(
      `Prescription dispensed for ${selectedToken.patient.name} (${selectedToken.token}) — ₹${customBillAmount} collected`,
      'success'
    );
    toast.success(`Medicines dispensed — ₹${customBillAmount} collected`);
    printReceipt(selectedToken, tempMedicines, customBillAmount);
    setSelectedTokenNumber(null);
    setShowDispenseConfirm(false);
  };

  const printReceipt = (token: Token, meds: Medicine[], amount: number) => {
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const html = `<!DOCTYPE html><html><head><title>Pharmacy Receipt – ${token.token}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:400px;margin:30px auto;font-size:12px;color:#111;}
      h1{font-size:16px;margin:0 0 2px;} h2{font-size:11px;color:#555;margin:0 0 16px;font-weight:normal;}
      .token{font-size:24px;font-weight:bold;font-family:monospace;text-align:center;background:#f5f5f5;padding:8px;border-radius:6px;margin:10px 0;}
      table{width:100%;border-collapse:collapse;margin:10px 0;} td{padding:4px 2px;} td:last-child{text-align:right;}
      tr.total td{border-top:2px solid #111;font-weight:bold;padding-top:6px;} .label{color:#666;font-size:10px;}
      @media print{body{margin:0;}}
    </style></head><body>
    <h1>OPD Pharmacy</h1><h2>Dispensing Receipt · ${date} · ${time}</h2>
    <div class="token">${token.token}</div>
    <p><b>Patient:</b> ${token.patient.name} · ${token.patient.age}y ${token.patient.gender}</p>
    <p><b>Doctor:</b> ${token.doctor.name} (${token.doctor.specialty})</p>
    <table>
      <tr><td class="label">Medicine</td><td class="label">Dosage</td></tr>
      ${meds.map(m => `<tr><td>${m.name}</td><td>${m.dosage}${m.duration ? ' · ' + m.duration : ''}</td></tr>`).join('')}
      <tr class="total"><td>Total</td><td>₹${amount}</td></tr>
    </table>
    <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank', 'width=500,height=600');
    if (w) { w.document.write(html); w.document.close(); }
  };

  /* ══════════════════════════════════════════════════════ */
  return (
    <div className="space-y-4">

      {/* ── Dialogs ── */}
      <AlertDialog open={showDispenseConfirm} onOpenChange={setShowDispenseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Dispensing</AlertDialogTitle>
            <AlertDialogDescription>
              Dispense <strong>{tempMedicines.length} medicine(s)</strong> to <strong>{selectedToken?.patient.name}</strong> and collect <strong>₹{customBillAmount}</strong>? A receipt will print automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDispense}>Confirm & Dispense</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingDeleteIndex !== null} onOpenChange={() => setPendingDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{pendingDeleteIndex !== null ? tempMedicines[pendingDeleteIndex]?.name : ''}</strong> from this prescription?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingDeleteIndex === null) return;
              const updated = tempMedicines.filter((_, i) => i !== pendingDeleteIndex);
              setTempMedicines(updated);
              setCustomBillAmount(updated.length * 150 + 20);
              setPendingDeleteIndex(null);
              toast.info('Medicine removed');
            }} className="bg-[var(--error-500)] hover:bg-[var(--error-700)] text-white">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--neutral-900)]">Pharmacy Portal</h1>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">Dispense prescriptions and collect payment</p>
        </div>
        {/* Stats pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--warning-50)] border border-[var(--warning-200)]">
            <Clock size={13} className="text-[var(--warning-500)]" />
            <span className="text-xs font-bold text-[var(--warning-700)]">{allPending.length} Pending</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--success-50)] border border-[var(--success-200)]">
            <CheckCircle2 size={13} className="text-[var(--success-500)]" />
            <span className="text-xs font-bold text-[var(--success-700)]">{allDispensed.length} Dispensed</span>
          </div>
        </div>
      </div>

      {/* ── New prescription alert banner ── */}
      {newCount > 0 && !alertDismissed && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--brand-500)] rounded-2xl">
          <div className="relative flex-shrink-0">
            <Bell size={16} className="text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--error-500)] rounded-full flex items-center justify-center text-[9px] font-bold text-white">{newCount}</span>
          </div>
          <p className="text-sm font-bold text-white flex-1">
            {newCount} new prescription{newCount > 1 ? 's' : ''} received from doctor
            {newCount === 1 && allPending.find(t => newTokenIds.has(t.token)) && (
              <span className="ml-1 text-white/80 font-normal text-xs">
                — {allPending.find(t => newTokenIds.has(t.token))?.patient.name} ({allPending.find(t => newTokenIds.has(t.token))?.token})
              </span>
            )}
          </p>
          <button
            onClick={() => {
              setActiveTab('pending');
              setAlertDismissed(true);
            }}
            className="flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            View <ArrowRight size={12} />
          </button>
          <button onClick={() => setAlertDismissed(true)} className="text-white/60 hover:text-white flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left: list ── */}
        <div className="lg:col-span-2 bg-white border border-[var(--neutral-200)] rounded-2xl overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-[var(--neutral-200)] bg-[var(--neutral-50)]">
            {(['pending', 'dispensed'] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSelectedTokenNumber(null); }}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab
                    ? 'border-[var(--brand-500)] text-[var(--brand-700)] bg-white'
                    : 'border-transparent text-[var(--neutral-500)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)]'
                }`}>
                {tab === 'pending' ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                {tab === 'pending' ? `Pending (${pendingTokens.length})` : `Dispensed (${dispensedTokens.length})`}
                {tab === 'pending' && newCount > 0 && (
                  <span className="text-[9px] font-bold bg-[var(--error-500)] text-white px-1.5 py-0.5 rounded-full animate-pulse">{newCount} new</span>
                )}
              </button>
            ))}
          </div>

          {/* Search + doctor filter */}
          <div className="px-4 pt-3 pb-2 border-b border-[var(--neutral-100)] space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient, token, mobile…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[var(--neutral-200)] rounded-lg bg-white focus:outline-none focus:border-[var(--brand-400)]" />
            </div>
            {pendingDoctors.length > 2 && (
              <div className="flex flex-wrap gap-1.5">
                {pendingDoctors.map(doc => (
                  <button key={doc} onClick={() => setDoctorFilter(doc)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      doctorFilter === doc
                        ? 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white'
                        : 'bg-white border-[var(--neutral-200)] text-[var(--neutral-600)] hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]'
                    }`}>
                    {doc === 'All' ? 'All Doctors' : `Dr. ${doc}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cards */}
          <div className="p-4 min-h-[400px] max-h-[580px] overflow-y-auto">
            {activeTab === 'pending' ? (
              pendingTokens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingTokens.map(t => {
                    const isNew = newTokenIds.has(t.token);
                    const isSelected = selectedTokenNumber === t.token;
                    return (
                      <div key={t.token} onClick={() => handleSelectToken(t)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-[var(--brand-500)] bg-[var(--brand-50)] ring-2 ring-[var(--brand-200)]'
                            : isNew
                              ? 'border-[var(--brand-300)] bg-[var(--brand-50)] hover:border-[var(--brand-500)]'
                              : 'border-[var(--neutral-200)] bg-white hover:border-[var(--brand-300)] hover:bg-[var(--neutral-50)]'
                        }`}>

                        {/* New badge */}
                        {isNew && (
                          <span className="absolute top-2.5 right-2.5 text-[9px] font-bold bg-[var(--brand-500)] text-white px-2 py-0.5 rounded-full animate-pulse">
                            NEW
                          </span>
                        )}

                        <div className="flex items-start justify-between mb-2 pr-10">
                          <span className="font-mono text-xs font-bold text-[var(--teal-700)] bg-[var(--teal-50)] border border-[var(--teal-200)] px-2 py-0.5 rounded-lg">
                            {t.token}
                          </span>
                          {t.urgent && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold bg-[var(--error-500)] text-white px-1.5 py-0.5 rounded-full">
                              <AlertCircle size={8} /> URGENT
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-sm text-[var(--neutral-900)]">{t.patient.name}</p>
                        <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">
                          {t.patient.age} yrs · {t.patient.gender}
                        </p>

                        {/* Doctor + medicine count row */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-semibold bg-[var(--neutral-100)] text-[var(--neutral-600)] px-2 py-0.5 rounded-md">
                            Dr. {t.doctor.name}
                          </span>
                          <span className="text-[10px] text-[var(--neutral-500)]">·</span>
                          <span className="text-[10px] text-[var(--neutral-600)]">
                            <Pill size={9} className="inline mr-0.5" />{t.prescription?.length} medicine{(t.prescription?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Waiting time */}
                        <div className="mt-2.5 pt-2.5 border-t border-[var(--neutral-100)] flex items-center justify-between">
                          <span className={`text-[10px] flex items-center gap-1 ${waitingColor(t.pharmacySentAt)}`}>
                            <Clock size={9} /> {waitingTime(t.pharmacySentAt)}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--brand-700)]">
                            ₹{(t.prescription?.length || 0) * 150 + 20} est.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Package size={36} className="text-[var(--neutral-300)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--neutral-700)]">No pending prescriptions</p>
                  <p className="text-xs text-[var(--neutral-400)] mt-1">Prescriptions appear here when a doctor sends them</p>
                </div>
              )
            ) : dispensedTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dispensedTokens.map(t => (
                  <div key={t.token} className="p-4 border border-[var(--neutral-200)] bg-[var(--neutral-50)] rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[var(--neutral-500)] bg-[var(--neutral-100)] border border-[var(--neutral-200)] px-2 py-0.5 rounded-lg">
                        {t.token}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--success-700)] bg-[var(--success-50)] border border-[var(--success-200)] px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={9} /> Dispensed
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[var(--neutral-900)]">{t.patient.name}</p>
                    <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">Dr. {t.doctor.name}</p>
                    <div className="mt-2.5 pt-2.5 border-t border-[var(--neutral-200)] flex items-center justify-between">
                      <span className="text-[10px] text-[var(--neutral-400)]">
                        {t.prescription?.length} medicine(s)
                      </span>
                      <span className="text-xs font-bold text-[var(--success-700)]">₹{t.billingAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle2 size={36} className="text-[var(--neutral-300)] mb-3" />
                <p className="text-sm font-semibold text-[var(--neutral-700)]">No dispensed history yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: detail panel ── */}
        <div>
          {selectedToken ? (
            <div className="bg-white border border-[var(--neutral-200)] rounded-2xl overflow-hidden shadow-sm">

              {/* Patient header */}
              <div className="px-5 py-4 border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[var(--brand-600)] uppercase tracking-widest">Prescription Detail</span>
                  <span className="font-mono text-xs font-bold text-[var(--teal-700)] bg-[var(--teal-50)] border border-[var(--teal-200)] px-2.5 py-0.5 rounded-lg">
                    {selectedToken.token}
                  </span>
                </div>
                <p className="text-base font-bold text-[var(--neutral-900)]">{selectedToken.patient.name}</p>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                  {selectedToken.patient.age} yrs · {selectedToken.patient.gender}
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold bg-[var(--brand-50)] border border-[var(--brand-200)] text-[var(--brand-700)] px-2 py-0.5 rounded-md">
                    Dr. {selectedToken.doctor.name}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--neutral-500)]">
                    {selectedToken.doctor.specialty}
                  </span>
                </div>
                {selectedToken.pharmacySentAt && (
                  <p className={`text-[10px] mt-2 flex items-center gap-1 ${waitingColor(selectedToken.pharmacySentAt)}`}>
                    <Clock size={9} /> Received {waitingTime(selectedToken.pharmacySentAt)}
                  </p>
                )}
              </div>

              <div className="px-5 py-4 space-y-4">

                {/* Medicines editor */}
                <div>
                  <p className="text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider mb-2">
                    Medicines <span className="text-[var(--neutral-300)]">({tempMedicines.length})</span>
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {tempMedicines.map((med, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 bg-[var(--neutral-50)] border border-[var(--neutral-100)] rounded-xl group">
                        <Pill size={11} className="text-[var(--brand-400)] flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--neutral-800)]">{med.name}</p>
                          <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">
                            {med.dosage}{med.duration ? ` · ${med.duration}` : ''}{med.instructions ? ` · ${med.instructions}` : ''}
                          </p>
                        </div>
                        <button onClick={() => setPendingDeleteIndex(idx)}
                          className="text-[var(--neutral-300)] hover:text-[var(--error-500)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add extra medicine */}
                  <div className="mt-3 pt-3 border-t border-[var(--neutral-100)] space-y-2">
                    <p className="text-[10px] font-semibold text-[var(--neutral-400)]">Add Extra / Alternative</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { field: 'name',         ph: 'Medicine name' },
                        { field: 'dosage',       ph: 'Dosage (1-0-1)' },
                        { field: 'duration',     ph: 'Duration' },
                        { field: 'instructions', ph: 'Instructions' },
                      ].map(({ field, ph }) => (
                        <input key={field} type="text" placeholder={ph}
                          value={(newMed as any)[field]}
                          onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
                          className="text-xs px-2.5 py-1.5 border border-[var(--neutral-200)] rounded-lg bg-white focus:outline-none focus:border-[var(--brand-400)]" />
                      ))}
                    </div>
                    <Button onClick={() => {
                      if (!newMed.name || !newMed.dosage) { toast.error('Name & dosage required'); return; }
                      const updated = [...tempMedicines, newMed];
                      setTempMedicines(updated);
                      setCustomBillAmount(updated.length * 150 + 20);
                      setNewMed({ name: '', dosage: '', duration: '', instructions: '' });
                    }} variant="secondary" className="w-full h-8 text-xs border border-[var(--brand-200)]">
                      <Plus size={11} /> Add Medicine
                    </Button>
                  </div>
                </div>

                {/* Billing */}
                <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-xl p-3.5 space-y-2">
                  <p className="text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider">Billing</p>
                  <div className="space-y-1 text-xs text-[var(--neutral-600)]">
                    <div className="flex justify-between">
                      <span>Medicines ({tempMedicines.length} × ₹150)</span>
                      <span>₹{tempMedicines.length * 150}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dispensing charge</span>
                      <span>₹20</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[var(--neutral-200)] font-bold text-[var(--neutral-900)]">
                      <span className="text-sm">Total</span>
                      <input type="number" value={customBillAmount}
                        onChange={e => setCustomBillAmount(Number(e.target.value))}
                        className="w-20 text-right text-sm bg-white border border-[var(--neutral-200)] rounded-lg px-2 py-0.5 focus:outline-none focus:border-[var(--brand-400)]" />
                    </div>
                  </div>
                </div>

                {/* Dispense CTA */}
                <button onClick={handleDispense}
                  className="w-full py-3 px-4 bg-[var(--success-600)] hover:bg-[var(--success-700)] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                  <ShoppingBag size={15} />
                  Dispense & Collect ₹{customBillAmount}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--neutral-50)] border-2 border-dashed border-[var(--neutral-200)] rounded-2xl p-8 text-center h-[420px] flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[var(--neutral-200)] flex items-center justify-center">
                <ShoppingBag size={22} className="text-[var(--neutral-300)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--neutral-700)]">Select a prescription</p>
                <p className="text-xs text-[var(--neutral-400)] mt-1 max-w-[180px] mx-auto">
                  Pick a patient from the list to review and dispense medicines
                </p>
              </div>
              {allPending.length > 0 && (
                <p className="text-[10px] font-bold text-[var(--warning-600)] bg-[var(--warning-50)] border border-[var(--warning-200)] px-3 py-1.5 rounded-full">
                  {allPending.length} prescription{allPending.length > 1 ? 's' : ''} waiting
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
