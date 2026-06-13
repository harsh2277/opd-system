import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, FileText, Clock, AlertCircle, Trash2, Plus,
  Pill, X, CheckCircle2, Stethoscope, LogOut, FlaskConical, ChevronRight,
  Activity, Heart, Thermometer, Weight, Droplet, Save, ChevronDown, ChevronUp,
  ArrowRight, ClipboardList,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { getPatientHistory } from '../data/dummyPatientHistory';
import { Input } from '../components/ui/input';
import { DoctorLayout } from '../components/DoctorLayout';

/* ─── Types ─── */
interface Medicine { name: string; dosage: string; duration: string; instructions: string; }
interface LabEntry { name: string; notes: string; }
interface HistoryNote {
  id: string; date: string; doctor: string; specialty?: string;
  diagnosis: string; prescription: string; notes: string;
  vitals?: { bp: string; temp: string; pulse: string; weight: string };
  labTests?: string;
}

/* ─── Static data ─── */
const MED_NAMES = [
  'Paracetamol 650mg', 'Amoxicillin 500mg', 'Ibuprofen 400mg', 'Cetirizine 10mg',
  'Pantoprazole 40mg', 'Metformin 500mg', 'Azithromycin 500mg', 'Omeprazole 20mg',
  'Atorvastatin 10mg', 'Amlodipine 5mg', 'Cough Syrup (Ascoril)', 'Multivitamin Capsule',
  'Doxycycline 100mg', 'Levofloxacin 500mg', 'Prednisolone 10mg', 'Montelukast 10mg',
];
const DOSAGES = [
  '1-0-1 (Morning & Night)', '1-0-0 (Morning only)', '1-1-1 (Three times daily)',
  '0-0-1 (Night only)', '1-1-0 (Morning & Afternoon)', 'Once daily', 'SOS (as needed)',
];
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '3 months'];
const LAB_TESTS = [
  'CBC (Complete Blood Count)', 'Blood Sugar - Fasting', 'Blood Sugar - Post Prandial',
  'HbA1c', 'Lipid Profile', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)',
  'Thyroid Profile (T3/T4/TSH)', 'Urine Routine & Microscopy', 'Dengue NS1 / IgM',
  'Malaria Parasite Smear', 'X-Ray Chest (PA View)', 'ECG (12 Lead)',
  'Ultrasound Abdomen', 'Serum Electrolytes', 'ESR', 'CRP', '2D Echo',
];

/* ─── Searchable dropdown ─── */
function Dropdown({ value, onChange, options, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { setQ(value); }, [value]);
  const filtered = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-xs border border-[var(--neutral-200)] rounded-lg bg-white focus:outline-none focus:border-[var(--brand-400)] placeholder-[var(--neutral-400)]"
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-auto bg-white border border-[var(--neutral-200)] rounded-xl shadow-lg z-20 py-1">
            {filtered.map(opt => (
              <button key={opt} type="button" onClick={() => { onChange(opt); setQ(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--neutral-50)] text-[var(--neutral-700)]">
                {opt}
              </button>
            ))}
            {q.trim() && !options.find(o => o.toLowerCase() === q.toLowerCase()) && (
              <button type="button" onClick={() => { onChange(q.trim()); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-[var(--brand-600)] font-semibold border-t border-[var(--neutral-100)] hover:bg-[var(--brand-50)]">
                + Use "{q}"
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════ */
export function DoctorPatientDetails() {
  const navigate = useNavigate();
  const { tokenId } = useParams();
  const {
    tokens, updateTokenStatus,
    requestLabTests, addNotification,
    prescriptionTemplates, savePrescriptionTemplate, deletePrescriptionTemplate,
    saveVitals, sendToPharmacy, saveConsultationNotes,
  } = useApp();

  const [token, setToken] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [history, setHistory] = useState<HistoryNote[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Consultation fields
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '' });

  // Prescription
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMed, setNewMed] = useState<Medicine>({ name: '', dosage: '', duration: '', instructions: '' });
  const [showTemplates, setShowTemplates] = useState(false);
  const [tplName, setTplName] = useState('');

  // Lab tests (initial consultation only)
  const [labTests, setLabTests] = useState<LabEntry[]>([]);
  const [newTest, setNewTest] = useState('');
  const [newTestNotes, setNewTestNotes] = useState('');
  const [labSent, setLabSent] = useState(false);

  const [unsavedDialog, setUnsavedDialog] = useState(false);
  const labInitialized = useRef(false);
  // Track if prescription was already sent to pharmacy in this session (prevents double-send)
  const pharmacySentThisSession = useRef(false);

  useEffect(() => {
    const docData = localStorage.getItem('current-doctor');
    let parsedDoc: any = null;
    if (docData) { parsedDoc = JSON.parse(docData); setDoctor(parsedDoc); }

    const found = tokens.find(t => t.id === tokenId);
    if (!found) { toast.error('Patient not found'); navigate('/doctor-dashboard'); return; }
    if (parsedDoc && found.doctor.id !== parsedDoc.id) {
      toast.error('Patient not assigned to you'); navigate('/doctor-dashboard'); return;
    }

    setToken(found);
    if (!labInitialized.current) {
      setLabTests((found.labTests || []).map((t: any) => ({ name: t.name, notes: t.notes || '' })));
      labInitialized.current = true;
    }
    setLabSent(found.labStatus === 'pending' || found.labStatus === 'completed');

    const saved = localStorage.getItem(`patient-history-${found.patient.mobile}`);
    const savedArr: HistoryNote[] = saved ? JSON.parse(saved) : [];
    const dummy = getPatientHistory(found.patient.mobile) as HistoryNote[];
    setHistory([...savedArr, ...dummy]);
  }, [tokenId, tokens, navigate]);

  if (!token) return null;

  const isActive    = token.status === 'in-consultation';
  const isLabReturn = token.labStatus === 'completed' && token.status === 'in-consultation';
  const labPending  = labTests.length > 0 && !labSent;

  /* ── Navigation helper ── */
  const goNext = async () => {
    const next = tokens.find(t => t.doctor.id === doctor?.id && t.status === 'waiting' && t.id !== token.id);
    if (next) { await updateTokenStatus(next.token, 'in-consultation'); navigate(`/doctor-patient/${next.id}`); toast.info(`Next: ${next.patient.name}`); }
    else navigate('/doctor-dashboard');
  };

  /* ── Save everything and advance (async — awaits all PATCHes before status update) ── */
  const saveConsultation = async () => {
    const entry: HistoryNote = {
      id: String(Date.now()), date: new Date().toISOString(),
      doctor: doctor?.name || 'Doctor',
      diagnosis,
      prescription: medicines.map((m, i) =>
        `${i + 1}. ${m.name} ${m.dosage}${m.duration ? ` · ${m.duration}` : ''}${m.instructions ? ` (${m.instructions})` : ''}`
      ).join('\n'),
      notes,
      vitals: vitals.bp || vitals.temp || vitals.pulse || vitals.weight ? { ...vitals } : undefined,
      labTests: (token.labTests || []).length > 0
        ? (token.labTests || []).map((t: any, i: number) => `${i + 1}. ${t.name}${t.notes ? ` — ${t.notes}` : ''}`).join('\n')
        : undefined,
    };
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem(`patient-history-${token.patient.mobile}`, JSON.stringify(updated));

    // Persist diagnosis and notes to backend
    if (diagnosis.trim() || notes.trim()) {
      await saveConsultationNotes(token.token, diagnosis.trim(), notes.trim());
    }

    if (vitals.bp || vitals.temp || vitals.pulse || vitals.weight) {
      await saveVitals(token.token, { ...vitals });
    }

    if (medicines.length > 0 && !pharmacySentThisSession.current) {
      // On lab return, always send a fresh prescription even if one was sent before.
      // On initial consultation, skip if already sent (e.g. via the inline "Send Now" button).
      const alreadySent = !isLabReturn && token.pharmacySentAt;
      if (!alreadySent) {
        pharmacySentThisSession.current = true;
        await sendToPharmacy(token.token, medicines);
        toast.success(`${medicines.length} medicine(s) sent to pharmacy`);
      }
    }

    if (labTests.length > 0 && !labSent) {
      await requestLabTests(token.token, labTests.map(t => ({ name: t.name, notes: t.notes })));
      addNotification(`Lab request: ${token.patient.name} (${token.token}) — ${labTests.length} test(s)`, 'info');
    }
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) { toast.error('Enter a diagnosis before completing'); return; }
    await saveConsultation();
    if (labPending) {
      await updateTokenStatus(token.token, 'lab-pending');
      toast.success('Patient sent to lab — results will return to your queue');
      navigate('/doctor-dashboard');
    } else {
      await updateTokenStatus(token.token, 'done');
      toast.success(medicines.length > 0 ? 'Consultation complete — prescription sent to pharmacy' : 'Consultation complete');
      goNext();
    }
  };

  const handleCompleteNoSave = async () => {
    const lp = token.labTests?.length > 0 && token.labStatus !== 'completed';
    await updateTokenStatus(token.token, lp ? 'lab-pending' : 'done');
    goNext();
  };

  const handleTopComplete = () => {
    if (diagnosis.trim()) { handleComplete(); }
    else if (medicines.length > 0) { setUnsavedDialog(true); }
    else { handleCompleteNoSave(); }
  };

  /* ── CTA label & colour ── */
  const ctaLabel = (() => {
    if (isLabReturn && medicines.length > 0) return 'Complete & Send Rx to Pharmacy';
    if (isLabReturn)                          return 'Save Final Diagnosis & Complete';
    if (labPending)                           return `Save & Send to Lab (${labTests.length} test${labTests.length > 1 ? 's' : ''})`;
    if (medicines.length > 0)                 return 'Save & Send to Pharmacy';
    return 'Save & Complete';
  })();

  const ctaColor = (() => {
    if (!diagnosis.trim())  return 'disabled';
    if (labPending)         return 'teal';
    return 'green';
  })();

  /* ── Footer hint ── */
  const footerHint = (() => {
    if (!diagnosis.trim())
      return { icon: <AlertCircle size={12} />, text: 'Diagnosis is required to complete', color: 'error' };
    if (isLabReturn && medicines.length > 0 && !token.pharmacySentAt)
      return { icon: <Pill size={12} />, text: 'Prescription (based on lab results) will be sent to pharmacy', color: 'brand' };
    if (isLabReturn)
      return { icon: <CheckCircle2 size={12} />, text: 'Consultation will be marked complete', color: 'success' };
    if (labPending)
      return { icon: <FlaskConical size={12} />, text: 'Patient will go to lab — results return to your queue automatically', color: 'teal' };
    if (medicines.length > 0 && !token.pharmacySentAt)
      return { icon: <Pill size={12} />, text: 'Prescription will be sent to pharmacy', color: 'brand' };
    return { icon: <CheckCircle2 size={12} />, text: 'Ready to complete consultation', color: 'neutral' };
  })();

  const hintColors: Record<string, string> = {
    error:   'text-[var(--error-600)]',
    brand:   'text-[var(--brand-700)]',
    success: 'text-[var(--success-700)]',
    teal:    'text-[var(--teal-700)]',
    neutral: 'text-[var(--neutral-500)]',
  };

  /* ═══════════════════════════════════════════════ */
  return (
    <DoctorLayout
      noPadding
      breadcrumb={
        <>
          <span className="font-bold text-[var(--neutral-900)]">{token.patient.name}</span>
          <span className="font-mono text-xs font-bold text-[var(--teal-700)] bg-[var(--teal-50)] border border-[var(--teal-200)] px-2 py-0.5 rounded-md">
            {token.token}
          </span>
          {isLabReturn && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-[var(--teal-500)] px-2.5 py-1 rounded-full animate-pulse">
              <FlaskConical size={10} /> Lab Return
            </span>
          )}
        </>
      }
      contextPanel={
        <div className="rounded-md border border-[var(--neutral-200)] bg-white p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[var(--neutral-100)] border border-[var(--neutral-200)] flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[var(--neutral-500)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--neutral-900)] truncate">{token.patient.name}</p>
              <p className="text-[10px] text-[var(--neutral-400)]">{token.patient.age} yrs · {token.patient.gender}</p>
            </div>
          </div>
          {token.patient.bloodGroup && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--error-600)] bg-[var(--error-50)] border border-[var(--error-200)] px-2 py-0.5 rounded-md">
                <Droplet size={8} /> {token.patient.bloodGroup}
              </span>
            </div>
          )}
          {token.patient.selectedConditions?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {token.patient.selectedConditions.map((c: string) => (
                <span key={c} className="text-[9px] font-semibold px-1.5 py-0.5 bg-[var(--error-50)] border border-[var(--error-200)] text-[var(--error-600)] rounded-md">{c}</span>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <div className="border-t border-[var(--neutral-200)] pt-2">
              <p className="text-[9px] font-bold text-[var(--neutral-400)] uppercase tracking-wider mb-1">Last visit</p>
              <p className="text-[10px] text-[var(--neutral-600)] line-clamp-2 leading-relaxed">{history[0].diagnosis}</p>
              <p className="text-[9px] text-[var(--neutral-400)] mt-0.5">
                {new Date(history[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      }
    >

      {/* ── Discard dialog ── */}
      <AlertDialog open={unsavedDialog} onOpenChange={setUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No diagnosis entered</AlertDialogTitle>
            <AlertDialogDescription>
              You have {medicines.length} medicine(s) added but no diagnosis. Without a diagnosis
              they <strong>won't be sent to pharmacy</strong>. Add a diagnosis first?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Add Diagnosis</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setUnsavedDialog(false); handleCompleteNoSave(); }}
              className="bg-[var(--error-500)] hover:bg-[var(--error-700)] text-white">
              Skip & Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto pb-24 animate-fade-in">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">

            {/* ══════════════════════════════════════
                LAB RETURN MODE — full banner + steps
                ══════════════════════════════════════ */}
            {isLabReturn && (
              <>
                {/* Lab results card */}
                <div className="rounded-2xl border-2 border-[var(--teal-400)] overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-5 py-4 bg-[var(--teal-500)]">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <FlaskConical size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Lab Report Received</p>
                      <p className="text-xs text-white/80">
                        {token.labCompletedAt
                          ? `Completed ${new Date(token.labCompletedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Results available — review below'}
                      </p>
                    </div>
                    <CheckCircle2 size={22} className="text-white/80 flex-shrink-0" />
                  </div>

                  <div className="bg-white px-5 py-4 space-y-4">
                    {/* Tests */}
                    {(token.labTests || []).length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider mb-2">Tests Performed</p>
                        <div className="flex flex-wrap gap-2">
                          {(token.labTests || []).map((t: any) => (
                            <span key={t.name} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[var(--teal-50)] border border-[var(--teal-200)] text-[var(--teal-700)] rounded-full">
                              <CheckCircle2 size={11} className="text-[var(--teal-500)]" /> {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Report notes */}
                    <div>
                      <p className="text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider mb-2">Report Notes from Lab</p>
                      {token.labReportNotes ? (
                        <div className="bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-xl px-4 py-3">
                          <p className="text-sm text-[var(--neutral-800)] whitespace-pre-line leading-relaxed">{token.labReportNotes}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--neutral-400)] italic px-1">No additional notes from lab technician.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step guide for lab return */}
                <div className="bg-white border border-[var(--neutral-200)] rounded-2xl px-5 py-4">
                  <p className="text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider mb-3">Complete These Steps</p>
                  <div className="flex items-center gap-0">
                    {[
                      { n: '1', label: 'Review report', icon: <FlaskConical size={13} />, done: true },
                      { n: '2', label: 'Write diagnosis', icon: <FileText size={13} />, done: !!diagnosis.trim() },
                      { n: '3', label: 'Prescribe medicines', icon: <Pill size={13} />, done: medicines.length > 0 },
                      { n: '4', label: 'Complete', icon: <CheckCircle2 size={13} />, done: false },
                    ].map((step, i, arr) => (
                      <div key={step.n} className="flex items-center flex-1 min-w-0">
                        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl flex-1 justify-center ${
                          step.done
                            ? 'bg-[var(--teal-50)] border border-[var(--teal-200)]'
                            : 'bg-[var(--neutral-50)] border border-[var(--neutral-200)]'
                        }`}>
                          <span className={step.done ? 'text-[var(--teal-600)]' : 'text-[var(--neutral-400)]'}>{step.icon}</span>
                          <span className={`text-[10px] font-bold hidden sm:block ${step.done ? 'text-[var(--teal-700)]' : 'text-[var(--neutral-500)]'}`}>{step.label}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <ArrowRight size={13} className="text-[var(--neutral-300)] flex-shrink-0 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════
                SECTION 1: VITALS
                ══════════════════════════════════════ */}
            <Section
              number={isLabReturn ? null : 1}
              title="Vitals"
              subtitle="Record current measurements"
              icon={<Activity size={14} />}
              collapsed={isLabReturn}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([
                  { key: 'bp',     label: 'Blood Pressure', unit: 'mmHg', ph: '120/80',  icon: <Heart     size={12} className="text-[var(--error-400)]"   /> },
                  { key: 'temp',   label: 'Temperature',    unit: '°F',   ph: '98.6',    icon: <Thermometer size={12} className="text-[var(--warning-500)]" /> },
                  { key: 'pulse',  label: 'Pulse Rate',     unit: 'bpm',  ph: '72',      icon: <Activity  size={12} className="text-[var(--brand-400)]"   /> },
                  { key: 'weight', label: 'Weight',         unit: 'kg',   ph: '65',      icon: <Weight    size={12} className="text-[var(--neutral-400)]" /> },
                ] as const).map(({ key, label, unit, ph, icon }) => (
                  <div key={key}>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-[var(--neutral-500)] uppercase tracking-wider mb-1.5">
                      {icon} {label}
                    </label>
                    <div className="relative">
                      <input type="text" value={vitals[key]}
                        onChange={e => setVitals({ ...vitals, [key]: e.target.value })}
                        placeholder={ph} disabled={!isActive}
                        className="w-full h-9 px-3 pr-12 text-sm border border-[var(--neutral-200)] rounded-lg bg-white focus:outline-none focus:border-[var(--brand-400)] disabled:bg-[var(--neutral-50)] disabled:text-[var(--neutral-400)]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--neutral-400)] font-medium pointer-events-none">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ══════════════════════════════════════
                SECTION 2: DIAGNOSIS  (required)
                ══════════════════════════════════════ */}
            <Section
              number={isLabReturn ? 1 : 2}
              title={isLabReturn ? 'Final Diagnosis' : 'Diagnosis & Notes'}
              subtitle={isLabReturn ? 'Based on examination + lab report' : 'Document clinical findings'}
              icon={<FileText size={14} />}
              required
              highlight={isLabReturn}
            >
              <div className={`grid gap-3 ${isLabReturn ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className="block text-xs font-bold text-[var(--neutral-600)] mb-1.5">
                    Diagnosis <span className="text-[var(--error-500)]">*</span>
                  </label>
                  <textarea
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder={isLabReturn ? 'Final diagnosis based on lab findings (e.g. Typhoid fever confirmed by Widal test)…' : 'Primary diagnosis…'}
                    rows={isLabReturn ? 3 : 4}
                    disabled={!isActive}
                    className="w-full px-3 py-2.5 text-sm border border-[var(--neutral-200)] rounded-xl resize-none bg-white focus:outline-none focus:border-[var(--brand-400)] placeholder-[var(--neutral-400)] disabled:bg-[var(--neutral-50)]"
                  />
                </div>
                {!isLabReturn && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--neutral-600)] mb-1.5">Clinical Notes</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Follow-up instructions, observations, advice…"
                      rows={4}
                      disabled={!isActive}
                      className="w-full px-3 py-2.5 text-sm border border-[var(--neutral-200)] rounded-xl resize-none bg-white focus:outline-none focus:border-[var(--brand-400)] placeholder-[var(--neutral-400)] disabled:bg-[var(--neutral-50)]"
                    />
                  </div>
                )}
                {isLabReturn && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--neutral-600)] mb-1.5">Follow-up Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Follow-up in X days, dietary advice, lifestyle changes…"
                      rows={2}
                      disabled={!isActive}
                      className="w-full px-3 py-2.5 text-sm border border-[var(--neutral-200)] rounded-xl resize-none bg-white focus:outline-none focus:border-[var(--brand-400)] placeholder-[var(--neutral-400)] disabled:bg-[var(--neutral-50)]"
                    />
                  </div>
                )}
              </div>
            </Section>

            {/* ══════════════════════════════════════
                SECTION 3: PRESCRIPTION
                On lab return this is the KEY action — highlighted
                ══════════════════════════════════════ */}
            <Section
              number={isLabReturn ? 2 : 3}
              title={isLabReturn ? 'Prescription  —  Based on Lab Report' : 'Prescription'}
              subtitle={isLabReturn ? 'Prescribe medicines as per lab findings' : 'Add medicines to prescribe'}
              icon={<Pill size={14} />}
              badge={medicines.length > 0 ? `${medicines.length} added` : undefined}
              highlight={isLabReturn}
            >
              {/* Lab return callout */}
              {isLabReturn && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-xl mb-4">
                  <ClipboardList size={13} className="text-[var(--teal-600)] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--teal-700)]">
                    Add medicines based on the lab report above. These will go directly to pharmacy
                    when you click <strong>Complete & Send Rx to Pharmacy</strong>.
                  </p>
                </div>
              )}

              {isActive && (
                <>
                  {/* Templates */}
                  <button onClick={() => setShowTemplates(v => !v)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--neutral-500)] hover:text-[var(--brand-600)] mb-3">
                    {showTemplates ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    Prescription Templates
                    {prescriptionTemplates.length > 0 && (
                      <span className="text-[9px] font-bold bg-[var(--brand-500)] text-white px-1.5 py-0.5 rounded-full">{prescriptionTemplates.length}</span>
                    )}
                  </button>

                  {showTemplates && (
                    <div className="mb-4 p-3 bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-xl space-y-2">
                      {prescriptionTemplates.length === 0 ? (
                        <p className="text-xs text-[var(--neutral-400)] text-center py-2">No templates saved yet</p>
                      ) : prescriptionTemplates.map(tpl => (
                        <div key={tpl.id} className="flex items-center justify-between bg-white border border-[var(--neutral-200)] rounded-lg px-3 py-2">
                          <div>
                            <p className="text-xs font-bold text-[var(--neutral-800)]">{tpl.name}</p>
                            <p className="text-[10px] text-[var(--neutral-400)]">{tpl.medicines.length} medicine(s)</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => { setMedicines(tpl.medicines); toast.success(`"${tpl.name}" loaded`); setShowTemplates(false); }}
                              className="text-[10px] font-bold px-2 py-1 bg-[var(--brand-50)] border border-[var(--brand-200)] text-[var(--brand-700)] rounded-lg">Load</button>
                            <button onClick={() => { deletePrescriptionTemplate(tpl.id); toast.info('Deleted'); }}
                              className="text-[10px] font-bold px-2 py-1 bg-white border border-[var(--neutral-200)] text-[var(--neutral-500)] rounded-lg hover:border-[var(--error-200)] hover:text-[var(--error-600)]">×</button>
                          </div>
                        </div>
                      ))}
                      {medicines.length > 0 && (
                        <div className="flex gap-2 pt-2 border-t border-[var(--neutral-100)]">
                          <input value={tplName} onChange={e => setTplName(e.target.value)}
                            placeholder="Save as template (e.g. Flu Protocol)"
                            className="flex-1 px-2.5 py-1.5 text-xs border border-[var(--neutral-200)] rounded-lg focus:outline-none focus:border-[var(--brand-400)]" />
                          <button onClick={() => {
                            if (!tplName.trim()) { toast.error('Enter name'); return; }
                            savePrescriptionTemplate(tplName.trim(), medicines);
                            setTplName(''); toast.success(`"${tplName.trim()}" saved`);
                          }} className="text-xs font-bold px-3 py-1.5 bg-[var(--brand-500)] text-white rounded-lg hover:bg-[var(--brand-700)]">Save</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add medicine row */}
                  <div className="flex gap-2 mb-3 flex-wrap sm:flex-nowrap">
                    <Dropdown value={newMed.name} onChange={v => setNewMed({ ...newMed, name: v })} options={MED_NAMES} placeholder="Medicine name *" className="flex-1 min-w-0" />
                    <Dropdown value={newMed.dosage} onChange={v => setNewMed({ ...newMed, dosage: v })} options={DOSAGES} placeholder="Dosage *" className="w-40 flex-shrink-0" />
                    <Dropdown value={newMed.duration} onChange={v => setNewMed({ ...newMed, duration: v })} options={DURATIONS} placeholder="Duration" className="w-28 flex-shrink-0" />
                    <Input value={newMed.instructions} onChange={e => setNewMed({ ...newMed, instructions: e.target.value })} placeholder="Instructions" variant="primary" className="flex-1 h-9 text-xs min-w-0" />
                    <button onClick={() => {
                      if (!newMed.name || !newMed.dosage) { toast.error('Name & dosage required'); return; }
                      setMedicines([...medicines, newMed]);
                      setNewMed({ name: '', dosage: '', duration: '', instructions: '' });
                    }} className="h-9 px-3 flex-shrink-0 flex items-center gap-1 text-xs font-semibold border border-[var(--neutral-200)] rounded-lg hover:border-[var(--brand-300)] hover:text-[var(--brand-600)]">
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </>
              )}

              {/* Medicine list */}
              {medicines.length > 0 ? (
                <div className="border border-[var(--neutral-200)] rounded-xl overflow-hidden">
                  {medicines.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--neutral-100)] last:border-0 bg-white hover:bg-[var(--neutral-50)] transition-colors">
                      <span className="text-xs text-[var(--neutral-400)] w-5 font-mono flex-shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0 text-sm">
                        <span className="font-semibold text-[var(--neutral-900)]">{m.name}</span>
                        <span className="text-[var(--neutral-500)] ml-2 text-xs">{m.dosage}</span>
                        {m.duration && <span className="text-[var(--neutral-400)] ml-1.5 text-xs">· {m.duration}</span>}
                        {m.instructions && <span className="text-[var(--neutral-400)] ml-1.5 text-xs italic">({m.instructions})</span>}
                      </div>
                      {isActive && (
                        <button onClick={() => setMedicines(medicines.filter((_, idx) => idx !== i))}
                          className="text-[var(--neutral-300)] hover:text-[var(--error-500)] flex-shrink-0">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--neutral-400)] py-3 text-center">
                  {isActive
                    ? isLabReturn ? 'Add medicines based on the lab report above' : 'No medicines added yet — use the form above'
                    : 'No medicines prescribed'}
                </p>
              )}
            </Section>

            {/* ══════════════════════════════════════
                SECTION 4: LAB TESTS
                Only on initial consultation
                ══════════════════════════════════════ */}
            {!isLabReturn && (
              <Section
                number={4}
                title="Lab Tests"
                subtitle="Order investigations if required"
                icon={<FlaskConical size={14} />}
                badge={labSent ? 'Sent to lab' : labTests.length > 0 ? `${labTests.length} ordered` : undefined}
              >
                {isActive && !labSent && (
                  <div className="flex gap-2 mb-3 flex-wrap sm:flex-nowrap">
                    <Dropdown value={newTest} onChange={setNewTest} options={LAB_TESTS} placeholder="Select test *" className="flex-1 min-w-0" />
                    <Input value={newTestNotes} onChange={e => setNewTestNotes(e.target.value)}
                      placeholder="Clinical indication (optional)" variant="primary" className="flex-1 h-9 text-xs min-w-0" />
                    <button onClick={() => {
                      const name = newTest.trim();
                      if (!name) { toast.error('Select a test'); return; }
                      if (labTests.find(t => t.name === name)) { toast.error('Already added'); return; }
                      setLabTests([...labTests, { name, notes: newTestNotes.trim() }]);
                      setNewTest(''); setNewTestNotes('');
                    }} className="h-9 px-3 flex-shrink-0 flex items-center gap-1 text-xs font-semibold border border-[var(--neutral-200)] rounded-lg hover:border-[var(--teal-300)] hover:text-[var(--teal-600)]">
                      <Plus size={13} /> Add
                    </button>
                  </div>
                )}
                {labTests.length > 0 ? (
                  <div className="border border-[var(--neutral-200)] rounded-xl overflow-hidden">
                    {labTests.map((t, i) => (
                      <div key={t.name} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--neutral-100)] last:border-0 bg-white">
                        <FlaskConical size={12} className="text-[var(--teal-500)] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--neutral-900)]">{t.name}</p>
                          {t.notes && <p className="text-xs text-[var(--neutral-500)] mt-0.5 italic">{t.notes}</p>}
                        </div>
                        {isActive && !labSent && (
                          <button onClick={() => setLabTests(labTests.filter((_, idx) => idx !== i))}
                            className="text-[var(--neutral-300)] hover:text-[var(--error-500)] flex-shrink-0 mt-0.5">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--neutral-400)] py-3 text-center">No tests added — optional</p>
                )}
                {labTests.length > 0 && isActive && (
                  <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-xl">
                    <FlaskConical size={13} className="text-[var(--teal-600)] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--teal-700)]">
                      When you click <strong>Save & Send to Lab</strong>, the patient goes to the lab.
                      Once results are ready they'll <strong>return to your queue automatically</strong>.
                    </p>
                  </div>
                )}
              </Section>
            )}

            {/* ══════════════════════════════════════
                SECTION 5: PAST HISTORY
                ══════════════════════════════════════ */}
            <div className="bg-white border border-[var(--neutral-200)] rounded-2xl overflow-hidden">
              <button onClick={() => setShowHistory(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--neutral-50)] transition-colors">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-[var(--neutral-500)]" />
                  <p className="text-sm font-bold text-[var(--neutral-900)]">Past Medical History</p>
                  <span className="text-xs text-[var(--neutral-400)] font-medium">{history.length} records</span>
                </div>
                {showHistory ? <ChevronUp size={15} className="text-[var(--neutral-400)]" /> : <ChevronDown size={15} className="text-[var(--neutral-400)]" />}
              </button>

              {showHistory && (
                <div className="border-t border-[var(--neutral-100)] px-5 py-5">
                  {history.length === 0 ? (
                    <p className="text-sm text-[var(--neutral-400)] text-center py-8">No previous records</p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-[var(--neutral-100)] space-y-5 ml-2">
                      {history.map(h => (
                        <div key={h.id} className="relative">
                          <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[var(--brand-300)] bg-white flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-300)]" />
                          </span>
                          <div className="flex items-start justify-between mb-1.5">
                            <div>
                              <span className="text-xs font-bold text-[var(--brand-700)] bg-[var(--brand-50)] border border-[var(--brand-100)] px-2 py-0.5 rounded-md">{h.doctor}</span>
                              <p className="text-[10px] text-[var(--neutral-400)] mt-1">
                                {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button onClick={() => {
                              if (!confirm('Delete record?')) return;
                              const u = history.filter(x => x.id !== h.id);
                              setHistory(u);
                              localStorage.setItem(`patient-history-${token.patient.mobile}`, JSON.stringify(u));
                            }} className="text-[var(--neutral-300)] hover:text-[var(--error-400)] p-0.5">
                              <Trash2 size={11} />
                            </button>
                          </div>
                          <p className="text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider">Diagnosis</p>
                          <p className="text-sm text-[var(--neutral-800)] mt-0.5 mb-2">{h.diagnosis}</p>
                          {h.prescription && (
                            <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-lg p-2.5 mb-2">
                              <p className="text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider mb-1">Rx</p>
                              <p className="text-xs text-[var(--neutral-700)] whitespace-pre-line">{h.prescription}</p>
                            </div>
                          )}
                          {h.labTests && (
                            <div className="bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-lg p-2.5 mb-2">
                              <p className="text-[10px] font-bold text-[var(--teal-600)] uppercase tracking-wider mb-1">Lab Tests</p>
                              <p className="text-xs text-[var(--neutral-700)] whitespace-pre-line">{h.labTests}</p>
                            </div>
                          )}
                          {h.vitals && (
                            <div className="flex flex-wrap gap-2">
                              {[['BP', h.vitals.bp, 'mmHg'], ['Temp', h.vitals.temp, '°F'], ['Pulse', h.vitals.pulse, 'bpm'], ['Wt', h.vitals.weight, 'kg']].map(([l, v, u]) => v ? (
                                <div key={l} className="border border-[var(--neutral-200)] px-2.5 py-1.5 rounded-lg bg-white">
                                  <p className="text-[9px] font-bold text-[var(--neutral-400)] uppercase">{l}</p>
                                  <p className="text-xs font-bold text-[var(--neutral-700)] mt-0.5">{v} <span className="text-[var(--neutral-400)] font-normal text-[10px]">{u}</span></p>
                                </div>
                              ) : null)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ Sticky footer CTA ══ */}
        {isActive && (
          <div className="sticky bottom-0 bg-white border-t border-[var(--neutral-200)] px-6 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold flex items-center gap-1.5 ${hintColors[footerHint.color]}`}>
                {footerHint.icon} {footerHint.text}
              </p>
            </div>

            <button
              onClick={handleTopComplete}
              disabled={ctaColor === 'disabled'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex-shrink-0 ${
                ctaColor === 'disabled' ? 'bg-[var(--neutral-200)] text-[var(--neutral-400)] cursor-not-allowed'
                : ctaColor === 'teal'   ? 'bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white'
                :                        'bg-[var(--success-600)] hover:bg-[var(--success-700)] text-white'
              }`}
            >
              {ctaColor === 'teal' ? <FlaskConical size={15} /> : <Save size={15} />}
              {ctaLabel}
            </button>
          </div>
        )}
    </DoctorLayout>
  );
}

/* ─── Section wrapper ─── */
function Section({ number, title, subtitle, icon, required, badge, action, children, highlight = false, collapsed = false }: {
  number: number | null; title: string; subtitle: string; icon: React.ReactNode;
  required?: boolean; badge?: string; action?: React.ReactNode;
  children: React.ReactNode; highlight?: boolean; collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);

  return (
    <div className={`bg-white rounded-2xl ${
      highlight ? 'border-2 border-[var(--teal-300)] shadow-sm' : 'border border-[var(--neutral-200)]'
    }`}>
      <div
        className={`flex items-center justify-between px-5 py-3.5 border-b cursor-pointer select-none rounded-t-2xl ${
          highlight ? 'border-[var(--teal-200)] bg-[var(--teal-50)]' : 'border-[var(--neutral-100)] bg-[var(--neutral-50)]'
        }`}
        onClick={() => collapsed && setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          {number !== null && (
            <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
              highlight ? 'bg-[var(--teal-200)] text-[var(--teal-800)]' : 'bg-[var(--brand-100)] text-[var(--brand-700)]'
            }`}>{number}</span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={highlight ? 'text-[var(--teal-600)]' : 'text-[var(--neutral-500)]'}>{icon}</span>
            <p className={`text-sm font-bold ${highlight ? 'text-[var(--teal-800)]' : 'text-[var(--neutral-900)]'}`}>{title}</p>
            {required && <span className="text-[var(--error-500)] text-xs font-bold">*</span>}
          </div>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--success-50)] border border-[var(--success-200)] text-[var(--success-700)] rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-[var(--neutral-400)] hidden sm:block">{subtitle}</p>
          {action}
          {collapsed && (
            open ? <ChevronUp size={14} className="text-[var(--neutral-400)] ml-1" /> : <ChevronDown size={14} className="text-[var(--neutral-400)] ml-1" />
          )}
        </div>
      </div>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}
