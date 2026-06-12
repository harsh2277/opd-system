import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Droplet,
  FileText,
  Clock,
  AlertCircle,
  Save,
  Trash2,
  Activity,
  Plus,
  Send,
  Pill,
  X,
  CheckCircle2,
  Stethoscope,
  LogOut,
  FlaskConical,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { getPatientHistory } from '../data/dummyPatientHistory';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface ConsultationNote {
  id: string;
  date: string;
  doctor: string;
  specialty?: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  vitals?: { bp: string; temp: string; pulse: string; weight: string };
  labTests?: string;
}

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

const MEDICINE_SUGGESTIONS = [
  'Paracetamol 650mg',
  'Amoxicillin 500mg',
  'Ibuprofen 400mg',
  'Cetirizine 10mg',
  'Pantoprazole 40mg',
  'Metformin 500mg',
  'Azithromycin 500mg',
  'Cough Syrup (Ascoril)',
  'Multivitamin Capsule'
];

const DOSAGE_SUGGESTIONS = [
  '1-0-1 (Morning & Night)',
  '1-0-0 (Morning only)',
  '1-1-1 (Three times a day)',
  '0-0-1 (Night only)',
  '1-1-0 (Morning & Afternoon)',
  'Once daily',
  'As needed (SOS)'
];

const DURATION_SUGGESTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '1 month',
  '3 months'
];

const LAB_TEST_SUGGESTIONS = [
  'CBC (Complete Blood Count)',
  'Blood Sugar - Fasting',
  'Blood Sugar - PP',
  'HbA1c',
  'Lipid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'Thyroid Profile',
  'Urine Routine',
  'Dengue NS1 / IgM',
  'Malaria Parasite Smear',
  'X-Ray Chest',
  'ECG',
  'Ultrasound Abdomen'
];

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
}

function SearchableDropdown({ value, onChange, options, placeholder, className = '' }: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Update search when value changes from outside (e.g. cleared)
  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: string) => {
    onChange(opt);
    setSearch(opt);
    setIsOpen(false);
  };

  const handleCustomAdd = () => {
    if (search.trim()) {
      onChange(search.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full h-9 px-3 text-xs border border-[var(--neutral-200)] rounded-md bg-white focus:outline-none focus:border-[var(--brand-500)] text-[var(--neutral-800)] placeholder-[var(--neutral-400)]"
      />
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border border-[var(--neutral-200)] rounded-md shadow-none z-20 py-1">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--neutral-100)] text-[var(--neutral-700)] focus:outline-none"
              >
                {opt}
              </button>
            ))}
            {search.trim() && !options.includes(search) && (
              <button
                type="button"
                onClick={handleCustomAdd}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--brand-50)] text-[var(--brand-600)] font-medium border-t border-[var(--neutral-100)] focus:outline-none"
              >
                + Use custom: "{search}"
              </button>
            )}
            {filtered.length === 0 && !search.trim() && (
              <div className="px-3 py-2 text-xs text-[var(--neutral-400)] text-center">No options available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function DoctorPatientDetails() {
  const navigate = useNavigate();
  const { tokenId } = useParams();
  const { tokens, updateTokenStatus, updateDoctorStatus, addPrescription, requestLabTests, addNotification } = useApp();
  const [token, setToken] = useState<any>(null);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  const [history, setHistory] = useState<ConsultationNote[]>([]);
  const [note, setNote] = useState({ diagnosis: '', notes: '' });
  const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '' });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMed, setNewMed] = useState<Medicine>({ name: '', dosage: '', duration: '', instructions: '' });
  const [labTests, setLabTests] = useState<string[]>([]);
  const [newLabTest, setNewLabTest] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [labSent, setLabSent] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const handleUpdateStatus = (status: 'on-duty' | 'off-duty' | 'break' | 'lunch') => {
    if (currentDoctor) {
      const updatedDoc = { ...currentDoctor, status };
      setCurrentDoctor(updatedDoc);
      localStorage.setItem('current-doctor', JSON.stringify(updatedDoc));
      updateDoctorStatus(currentDoctor.id, status);
      toast.success(`Status updated to ${status === 'on-duty' ? 'Active' : status}`);
    }
  };

  useEffect(() => {
    const doc = localStorage.getItem('current-doctor');
    let parsedDoctor = null;
    if (doc) {
      parsedDoctor = JSON.parse(doc);
      setCurrentDoctor(parsedDoctor);
    }

    const found = tokens.find((t) => t.id === tokenId);
    if (!found) {
      toast.error('Patient not found');
      navigate('/doctor-dashboard');
      return;
    }

    // Ownership guard: prevent doctors from accessing other doctors' patients
    if (parsedDoctor && found.doctor.id !== parsedDoctor.id) {
      toast.error('This patient is not assigned to you');
      navigate('/doctor-dashboard');
      return;
    }

    setToken(found);
    setLabTests((found.labTests || []).map((test: { name: string }) => test.name));
    setLabNotes((found.labTests || [])[0]?.notes || '');
    setLabSent(found.labStatus === 'pending' || found.labStatus === 'completed');

    const saved = localStorage.getItem(`patient-history-${found.patient.mobile}`);
    const savedHistory: ConsultationNote[] = saved ? JSON.parse(saved) : [];
    const dummy = getPatientHistory(found.patient.mobile) as ConsultationNote[];
    setHistory([...savedHistory, ...dummy]);
  }, [tokenId, tokens, navigate]);

  const handleAddMedicine = () => {
    if (!newMed.name || !newMed.dosage) {
      toast.error('Name and dosage required');
      return;
    }
    setMedicines([...medicines, newMed]);
    setNewMed({ name: '', dosage: '', duration: '', instructions: '' });
  };

  const handleSendToPharmacy = () => {
    if (medicines.length === 0) {
      toast.error('Add medicines first');
      return;
    }
    toast.success(`${medicines.length} medicine(s) sent to pharmacy`);
  };

  const handleAddLabTest = () => {
    const testName = newLabTest.trim();
    if (!testName) {
      toast.error('Select a lab test first');
      return;
    }
    if (labTests.includes(testName)) {
      toast.error('This lab test is already added');
      return;
    }
    setLabTests([...labTests, testName]);
    setNewLabTest('');
    setLabSent(false);
  };

  const handleSendToLab = () => {
    if (!token) return;
    if (labTests.length === 0) {
      toast.error('Add at least one lab test');
      return;
    }
    requestLabTests(
      token.token,
      labTests.map((name) => ({ name, notes: labNotes }))
    );
    addNotification(
      `Lab request sent for ${token.patient.name} (${token.token}) - ${labTests.length} test(s)`,
      'info'
    );
    setLabSent(true);
    toast.success(`${labTests.length} lab test(s) sent to lab`);
  };

  const handleSaveAndComplete = () => {
    if (!note.diagnosis) {
      toast.error('Diagnosis is required');
      return;
    }
    const entry: ConsultationNote = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      doctor: currentDoctor?.name || 'Doctor',
      diagnosis: note.diagnosis,
      prescription: medicines
        .map((m, i) => `${i + 1}. ${m.name} ${m.dosage}${m.duration ? ` · ${m.duration}` : ''}${m.instructions ? ` (${m.instructions})` : ''}`)
        .join('\n'),
      notes: note.notes,
      vitals: vitals.bp || vitals.temp || vitals.pulse || vitals.weight ? { ...vitals } : undefined,
      labTests: labTests.length > 0 ? labTests.map((test, i) => `${i + 1}. ${test}`).join('\n') : undefined,
    };
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem(`patient-history-${token.patient.mobile}`, JSON.stringify(updated));
    setNote({ diagnosis: '', notes: '' });
    setVitals({ bp: '', temp: '', pulse: '', weight: '' });
    setMedicines([]);
    
    if (medicines.length > 0) {
      addPrescription(token.token, medicines);
      toast.success(`${medicines.length} medicine(s) sent to pharmacy`);
    }

    if (labTests.length > 0 && !labSent) {
      requestLabTests(
        token.token,
        labTests.map((name) => ({ name, notes: labNotes }))
      );
      addNotification(
        `Lab request sent for ${token.patient.name} (${token.token}) - ${labTests.length} test(s)`,
        'info'
      );
      toast.success(`${labTests.length} lab test(s) sent to lab`);
    }
    
    updateTokenStatus(token.token, 'done');
    toast.success('Consultation saved and completed');

    // Call next patient if queue is not empty
    const nextToken = tokens.find(
      (t) => t.doctor.id === currentDoctor?.id && t.status === 'waiting' && t.id !== token.id
    );
    if (nextToken) {
      updateTokenStatus(nextToken.token, 'in-consultation');
      navigate(`/doctor-patient/${nextToken.id}`);
      toast.info(`Next patient called: ${nextToken.patient.name}`);
    } else {
      navigate('/doctor-dashboard');
    }
  };

  const hasUnsavedWork = medicines.length > 0 || note.diagnosis.trim() !== '';

  const handleComplete = () => {
    if (note.diagnosis.trim()) {
      handleSaveAndComplete();
    } else if (medicines.length > 0) {
      // Medicines added but no diagnosis — warn before discarding
      setShowUnsavedDialog(true);
    } else {
      doCompleteWithoutSaving();
    }
  };

  const doCompleteWithoutSaving = () => {
    updateTokenStatus(token.token, 'done');
    toast.success('Consultation completed');
    const nextToken = tokens.find(
      (t) => t.doctor.id === currentDoctor?.id && t.status === 'waiting' && t.id !== token.id
    );
    if (nextToken) {
      updateTokenStatus(nextToken.token, 'in-consultation');
      navigate(`/doctor-patient/${nextToken.id}`);
      toast.info(`Next patient called: ${nextToken.patient.name}`);
    } else {
      navigate('/doctor-dashboard');
    }
  };

  const handleDeleteNote = (id: string) => {
    if (!confirm('Delete this record?')) return;
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(`patient-history-${token.patient.mobile}`, JSON.stringify(updated));
  };

  if (!token) return null;

  const isActive = token.status === 'in-consultation';

  return (
    <div className="flex h-screen bg-[var(--neutral-50)] font-sans">
      {/* Unsaved changes guard dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Medicines</AlertDialogTitle>
            <AlertDialogDescription>
              You have {medicines.length} medicine(s) added but no diagnosis saved. If you complete now, these medicines will be discarded and <strong>not sent to pharmacy</strong>. Do you want to add a diagnosis first?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Go Back &amp; Add Diagnosis
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setShowUnsavedDialog(false); doCompleteWithoutSaving(); }}
              className="bg-[var(--error-500)] hover:bg-[var(--error-700)] text-white"
            >
              Discard &amp; Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Sidebar — same as dashboard */}
      <aside className="w-56 bg-white border-r border-[var(--neutral-200)] flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-[var(--neutral-200)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--brand-500)] rounded flex items-center justify-center flex-shrink-0">
              <Stethoscope size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--neutral-800)] leading-none">OPD System</p>
              <p className="text-xs text-[var(--neutral-400)] mt-1">Doctor Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          <Button
            variant="line"
            onClick={() => navigate('/doctor-dashboard')}
            className="w-full flex items-center justify-start gap-3 px-3 py-2 text-xs font-normal border-none hover:bg-[var(--neutral-100)]"
          >
            <ArrowLeft size={14} />
            <span>Back to Queue</span>
          </Button>
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-[var(--brand-50)] text-[var(--brand-700)] font-medium text-sm">
            <FileText size={16} className="text-[var(--brand-500)]" />
            <span>Patient Details</span>
          </div>
        </div>


        <div className="px-3 py-3 border-t border-[var(--neutral-200)] bg-[var(--neutral-50)]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--neutral-200)] flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[var(--neutral-600)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--neutral-700)] font-medium truncate">{currentDoctor?.name ?? 'Doctor'}</p>
              <p className="text-[10px] text-[var(--neutral-400)] truncate">{currentDoctor?.specialty ?? ''}</p>
            </div>
            <button
              onClick={() => { localStorage.removeItem('current-doctor'); localStorage.removeItem('opd-doctor-session-start'); navigate('/'); }}
              className="text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[var(--neutral-200)] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[var(--neutral-500)]">
            <span>Doctor</span>
            <span className="text-[var(--neutral-300)]">/</span>
            <span className="text-[var(--neutral-900)] font-medium">{token.patient.name}</span>
            <span className="font-mono text-xs text-[var(--brand-700)] bg-[var(--brand-50)] px-2 py-0.5 rounded ml-1 font-semibold">· {token.token}</span>
          </div>
          <div className="flex items-center gap-3">
            {isActive && (
              <Button
                onClick={handleComplete}
                variant="primary"
                className="bg-[var(--success-600)] hover:bg-[var(--success-700)] text-xs py-1.5 h-8"
              >
                <CheckCircle2 size={14} />
                Complete Consultation
              </Button>
            )}
            <div className="w-8 h-8 rounded-full bg-[var(--neutral-100)] border border-[var(--neutral-200)] flex items-center justify-center">
              <User size={15} className="text-[var(--neutral-600)]" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-12 gap-5">
            {/* Left: Patient info */}
            <div className="col-span-3 space-y-4">
              {/* Patient card */}
              <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
                <div className="px-5 py-4 border-b border-[var(--neutral-100)]">
                  <p className="text-sm font-medium text-[var(--neutral-900)]">Patient Info</p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-[var(--neutral-200)] bg-[var(--neutral-100)] flex items-center justify-center flex-shrink-0">
                      <User size={15} className="text-[var(--neutral-500)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--neutral-900)]">{token.patient.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 border border-[var(--teal-200)] text-[var(--teal-700)] rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal-500)]" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--neutral-400)]">Age / Gender</span>
                      <span className="text-xs font-medium text-[var(--neutral-700)]">
                        {token.patient.age} yrs · {token.patient.gender}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--neutral-400)]">Mobile</span>
                      <span className="text-xs font-medium text-[var(--neutral-700)]">{token.patient.mobile}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--neutral-400)]">Blood Group</span>
                      <span className="text-xs px-2 py-0.5 border border-[var(--neutral-200)] rounded text-[var(--neutral-700)] font-medium">
                        {token.patient.bloodGroup || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--neutral-400)]">Token</span>
                      <span className="font-mono text-xs font-semibold text-[var(--teal-600)] bg-[var(--teal-50)] px-2 py-0.5 rounded">
                        {token.token}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              {token.patient.selectedConditions?.length > 0 && (
                <div className="bg-white border border-[var(--error-200)] rounded-lg px-5 py-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <AlertCircle size={13} className="text-[var(--error-500)]" />
                    <p className="text-xs font-medium text-[var(--error-700)] uppercase tracking-wide">Conditions</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {token.patient.selectedConditions.map((c: string) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-0.5 border border-[var(--error-200)] text-[var(--error-600)] rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* History count */}
              <div className="bg-white border border-[var(--neutral-200)] rounded-lg px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-500)]">
                  <FileText size={12} />
                  Medical history
                </div>
                <span className="text-xs font-semibold text-[var(--neutral-700)]">{history.length} records</span>
              </div>
            </div>

            {/* Right: Consultation + history */}
            <div className="col-span-9 space-y-5">
              {/* Consultation form */}
              <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
                <div className="px-5 py-4 border-b border-[var(--neutral-100)]">
                  <p className="text-sm font-medium text-[var(--neutral-900)]">New Consultation</p>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">Record diagnosis, notes and prescription</p>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1.5">
                        Diagnosis <span className="text-[var(--error-500)]">*</span>
                      </label>
                      <textarea
                        value={note.diagnosis}
                        onChange={(e) => setNote({ ...note, diagnosis: e.target.value })}
                        placeholder="Primary diagnosis..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-md resize-none bg-white text-[var(--neutral-900)] focus:outline-none focus:border-[var(--teal-400)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--neutral-600)] mb-1.5">Notes</label>
                      <textarea
                        value={note.notes}
                        onChange={(e) => setNote({ ...note, notes: e.target.value })}
                        placeholder="Follow-up instructions, observations..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-md resize-none bg-white text-[var(--neutral-900)] focus:outline-none focus:border-[var(--teal-400)]"
                      />
                    </div>
                  </div>

                  {/* Vitals Input */}
                  <div className="border-t border-[var(--neutral-100)] pt-4">
                    <p className="text-xs font-semibold text-[var(--neutral-700)] mb-3">Vitals & Testing Details</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--neutral-500)] mb-1">Blood Pressure (BP)</label>
                        <Input
                          value={vitals.bp}
                          onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                          placeholder="e.g. 120/80"
                          variant="primary"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--neutral-500)] mb-1">Temperature (°F)</label>
                        <Input
                          value={vitals.temp}
                          onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                          placeholder="e.g. 98.6°F"
                          variant="primary"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--neutral-500)] mb-1">Pulse Rate (bpm)</label>
                        <Input
                          value={vitals.pulse}
                          onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                          placeholder="e.g. 72"
                          variant="primary"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[var(--neutral-500)] mb-1">Weight (kg)</label>
                        <Input
                          value={vitals.weight}
                          onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                          placeholder="e.g. 65kg"
                          variant="primary"
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prescription */}
                  <div className="border-t border-[var(--neutral-100)] pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Pill size={13} className="text-[var(--neutral-400)]" />
                        <span className="text-xs font-medium text-[var(--neutral-700)]">Prescription</span>
                        {medicines.length > 0 && (
                          <span className="text-xs text-[var(--neutral-400)]">({medicines.length})</span>
                        )}
                      </div>
                      {medicines.length > 0 && (
                        <button
                          onClick={handleSendToPharmacy}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[var(--neutral-200)] text-[var(--neutral-600)] hover:border-[var(--teal-300)] hover:text-[var(--teal-600)] rounded-md transition-colors"
                        >
                          <Send size={11} />
                          Send to Pharmacy
                        </button>
                      )}
                    </div>

                    {/* Add medicine */}
                    <div className="flex gap-2 mb-3">
                      <SearchableDropdown
                        value={newMed.name}
                        onChange={(val) => setNewMed({ ...newMed, name: val })}
                        options={MEDICINE_SUGGESTIONS}
                        placeholder="Medicine *"
                      />

                      <SearchableDropdown
                        value={newMed.dosage}
                        onChange={(val) => setNewMed({ ...newMed, dosage: val })}
                        options={DOSAGE_SUGGESTIONS}
                        placeholder="Dosage *"
                        className="w-36 flex-none"
                      />

                      <SearchableDropdown
                        value={newMed.duration}
                        onChange={(val) => setNewMed({ ...newMed, duration: val })}
                        options={DURATION_SUGGESTIONS}
                        placeholder="Duration"
                        className="w-28 flex-none"
                      />

                      <Input
                        value={newMed.instructions}
                        onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                        placeholder="Instructions"
                        variant="primary"
                        className="flex-1 h-9 text-xs"
                      />

                      <Button
                        onClick={handleAddMedicine}
                        variant="line"
                        className="h-9 px-3 flex-shrink-0 text-xs border-[var(--neutral-200)]"
                      >
                        <Plus size={14} />
                        Add
                      </Button>
                    </div>

                    {medicines.length > 0 && (
                      <div className="border border-[var(--neutral-200)] rounded-md overflow-hidden">
                        {medicines.map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--neutral-100)] last:border-0 bg-white"
                          >
                            <span className="text-xs font-mono text-[var(--neutral-400)] w-4">{i + 1}</span>
                            <div className="flex-1 min-w-0 text-sm">
                              <span className="font-medium text-[var(--neutral-900)]">{m.name}</span>
                              <span className="text-[var(--neutral-400)] ml-2">{m.dosage}</span>
                              {m.duration && <span className="text-[var(--neutral-400)] ml-2">· {m.duration}</span>}
                              {m.instructions && (
                                <span className="text-[var(--neutral-400)] ml-2 italic">({m.instructions})</span>
                              )}
                            </div>
                            <button
                              onClick={() => setMedicines(medicines.filter((_, idx) => idx !== i))}
                              className="text-[var(--neutral-300)] hover:text-[var(--error-500)] transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lab Requests */}
                  <div className="border-t border-[var(--neutral-100)] pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <FlaskConical size={13} className="text-[var(--neutral-400)]" />
                        <span className="text-xs font-medium text-[var(--neutral-700)]">Lab Request</span>
                        {labTests.length > 0 && (
                          <span className="text-xs text-[var(--neutral-400)]">({labTests.length})</span>
                        )}
                      </div>
                      {labTests.length > 0 && (
                        <button
                          onClick={handleSendToLab}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[var(--neutral-200)] text-[var(--neutral-600)] hover:border-[var(--teal-300)] hover:text-[var(--teal-600)] rounded-md transition-colors"
                        >
                          <Send size={11} />
                          {labSent ? 'Update Lab Request' : 'Send to Lab'}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 mb-3">
                      <SearchableDropdown
                        value={newLabTest}
                        onChange={setNewLabTest}
                        options={LAB_TEST_SUGGESTIONS}
                        placeholder="Select report / test type"
                      />
                      <Input
                        value={labNotes}
                        onChange={(e) => {
                          setLabNotes(e.target.value);
                          setLabSent(false);
                        }}
                        placeholder="Lab notes / clinical indication"
                        variant="primary"
                        className="flex-1 h-9 text-xs"
                      />
                      <Button
                        onClick={handleAddLabTest}
                        variant="line"
                        className="h-9 px-3 flex-shrink-0 text-xs border-[var(--neutral-200)]"
                      >
                        <Plus size={14} />
                        Add
                      </Button>
                    </div>

                    {labTests.length > 0 && (
                      <div className="border border-[var(--neutral-200)] rounded-md overflow-hidden">
                        {labTests.map((test, i) => (
                          <div
                            key={test}
                            className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--neutral-100)] last:border-0 bg-white"
                          >
                            <span className="text-xs font-mono text-[var(--neutral-400)] w-4">{i + 1}</span>
                            <div className="flex-1 min-w-0 text-sm">
                              <span className="font-medium text-[var(--neutral-900)]">{test}</span>
                              {labNotes && <span className="text-[var(--neutral-400)] ml-2 italic">({labNotes})</span>}
                            </div>
                            <button
                              onClick={() => {
                                setLabTests(labTests.filter((_, idx) => idx !== i));
                                setLabSent(false);
                              }}
                              className="text-[var(--neutral-300)] hover:text-[var(--error-500)] transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[var(--neutral-100)] pt-4">
                    <Button
                      onClick={handleSaveAndComplete}
                      disabled={!note.diagnosis}
                      variant="primary"
                      className="w-full text-xs font-semibold py-2.5 h-10"
                    >
                      <Save size={14} />
                      {medicines.length === 0 && labTests.length === 0
                        ? 'Save and Next Patient'
                        : `Save and Send ${[
                            medicines.length > 0 ? 'Pharmacy' : '',
                            labTests.length > 0 ? 'Lab' : '',
                          ].filter(Boolean).join(' & ')} & Next Patient`}
                    </Button>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--neutral-100)]">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[var(--neutral-500)]" />
                    <h3 className="text-sm font-semibold text-[var(--neutral-900)]">Patient Medical History</h3>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 border border-[var(--neutral-200)] text-[var(--neutral-600)] rounded-full">
                    {history.length} {history.length === 1 ? 'Record' : 'Records'}
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="py-12 text-center text-[var(--neutral-400)] text-sm">
                    No previous medical records found for this patient.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-[var(--neutral-200)] space-y-6 ml-2">
                    {history.map((h) => (
                      <div key={h.id} className="relative">
                        {/* Timeline dot */}
                        <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[var(--brand-500)] bg-white flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-500)]" />
                        </span>

                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-semibold text-[var(--brand-700)] bg-[var(--brand-50)] px-2 py-0.5 rounded">
                              {h.doctor}
                            </span>
                            {h.specialty && (
                              <span className="text-xs text-[var(--neutral-500)] ml-2">
                                ({h.specialty})
                              </span>
                            )}
                            <p className="text-[11px] text-[var(--neutral-400)] mt-1.5 flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(h.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(h.id)}
                            className="text-[var(--neutral-300)] hover:text-[var(--error-500)] transition-colors p-1 rounded hover:bg-[var(--neutral-100)]"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="mt-3 space-y-3 pl-1">
                          <div>
                            <p className="text-[10px] font-semibold text-[var(--neutral-400)] uppercase tracking-wider">Diagnosis</p>
                            <p className="text-sm text-[var(--neutral-800)] mt-0.5 leading-relaxed">{h.diagnosis}</p>
                          </div>
                          
                          {h.prescription && (
                            <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-md p-3">
                              <p className="text-[10px] font-semibold text-[var(--neutral-500)] uppercase tracking-wider mb-1">Prescribed Medicines</p>
                              <p className="text-xs text-[var(--neutral-700)] whitespace-pre-line leading-relaxed">{h.prescription}</p>
                            </div>
                          )}

                          {h.notes && (
                            <div>
                              <p className="text-[10px] font-semibold text-[var(--neutral-400)] uppercase tracking-wider">Doctor's Notes</p>
                              <p className="text-xs text-[var(--neutral-600)] mt-0.5 leading-relaxed">{h.notes}</p>
                            </div>
                          )}

                          {h.labTests && (
                            <div className="bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-md p-3">
                              <p className="text-[10px] font-semibold text-[var(--teal-700)] uppercase tracking-wider mb-1">Lab Tests Requested</p>
                              <p className="text-xs text-[var(--neutral-700)] whitespace-pre-line leading-relaxed">{h.labTests}</p>
                            </div>
                          )}

                          {h.vitals && (
                            <div className="flex flex-wrap gap-4 pt-2">
                              {[
                                { label: 'BP', value: h.vitals.bp },
                                { label: 'Temp', value: h.vitals.temp },
                                { label: 'Pulse', value: h.vitals.pulse },
                                { label: 'Weight', value: h.vitals.weight },
                              ].map((v) => (
                                <div key={v.label} className="border border-[var(--neutral-200)] px-2 py-1 rounded bg-white min-w-[70px]">
                                  <p className="text-[10px] text-[var(--neutral-400)] font-medium leading-none">{v.label}</p>
                                  <p className="text-xs font-semibold text-[var(--neutral-700)] mt-1">{v.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Divider between timeline nodes if not last */}
                        <div className="h-4" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
