import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  LogOut,
  ArrowRight,
  AlertCircle,
  User,
  Bell,
  Search,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { getPatientHistory } from '../data/dummyPatientHistory';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  queue: number;
  avgWait: number;
  status: 'on-duty' | 'off-duty';
}

export function DoctorDashboardNew() {
  const navigate = useNavigate();
  const { tokens, updateTokenStatus } = useApp();
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [sessionTime, setSessionTime] = useState('0:00');
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('current-doctor');
    if (!data) {
      toast.error('Please login first');
      navigate('/');
      return;
    }
    setCurrentDoctor(JSON.parse(data));
  }, [navigate]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setSessionTime(`${h}:${String(m).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!currentDoctor) return null;

  const myTokens = tokens.filter((t) => t.doctor.id === currentDoctor.id);
  const waitingTokens = myTokens.filter((t) => t.status === 'waiting');
  const inConsultation = myTokens.find((t) => t.status === 'in-consultation');
  const doneCount = myTokens.filter((t) => t.status === 'done').length;

  const handleStart = (tokenId: string, tokenNumber: string) => {
    if (inConsultation) {
      toast.error('Finish current consultation first');
      return;
    }
    updateTokenStatus(tokenNumber, 'in-consultation');
    navigate(`/doctor-patient/${tokenId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('current-doctor');
    navigate('/');
  };

  const uniquePatients = Array.from(
    new Map(tokens.map((t) => [t.patient.mobile, t.patient])).values()
  );

  const filteredPatients = uniquePatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile.includes(searchQuery)
  );

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    const saved = localStorage.getItem(`patient-history-${patient.mobile}`);
    const savedHistory = saved ? JSON.parse(saved) : [];
    const dummy = getPatientHistory(patient.mobile) || [];
    setSelectedPatientHistory([...savedHistory, ...dummy]);
  };

  const stats = [
    { label: 'Waiting', value: waitingTokens.length, icon: Users },
    { label: 'In Consultation', value: inConsultation ? 1 : 0, icon: Stethoscope },
    { label: 'Completed', value: doneCount, icon: CheckCircle2 },
    { label: 'Avg Wait', value: `${currentDoctor.avgWait}m`, icon: Clock },
  ];

  return (
    <div className="flex h-screen bg-[var(--neutral-50)] font-sans">
      {/* Sidebar — doctor brand */}
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
          <button
            onClick={() => setActiveTab('queue')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'queue'
                ? 'bg-[var(--brand-50)] text-[var(--brand-700)]'
                : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'
            }`}
          >
            <Users size={16} className={activeTab === 'queue' ? 'text-[var(--brand-500)]' : 'text-[var(--neutral-400)]'} />
            <span>My Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'bg-[var(--brand-50)] text-[var(--brand-700)]'
                : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'
            }`}
          >
            <Clock size={16} className={activeTab === 'history' ? 'text-[var(--brand-500)]' : 'text-[var(--neutral-400)]'} />
            <span>Patient History</span>
          </button>

          {inConsultation && (
            <button
              onClick={() => navigate(`/doctor-patient/${inConsultation.id}`)}
              className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)] transition-colors"
            >
              <Stethoscope size={16} className="text-[var(--neutral-400)]" />
              <span>Current Patient</span>
            </button>
          )}
        </div>

        {/* Session info + logout */}
        <div className="px-3 py-3 border-t border-[var(--neutral-200)] bg-[var(--neutral-50)]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--neutral-200)] flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[var(--neutral-600)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--neutral-700)] font-medium truncate">{currentDoctor.name}</p>
              <p className="text-[10px] text-[var(--neutral-400)] truncate">{currentDoctor.specialty}</p>
            </div>
            <button
              onClick={handleLogout}
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
        {/* Top bar — same as admin */}
        <header className="h-14 bg-white border-b border-[var(--neutral-200)] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[var(--neutral-500)]">
            <span>Doctor</span>
            <span className="text-[var(--neutral-300)]">/</span>
            <span className="text-[var(--neutral-900)] font-medium">Waiting Queue</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--neutral-400)] font-mono">{sessionTime}</span>
            <div className="w-8 h-8 rounded-full bg-[var(--neutral-100)] border border-[var(--neutral-200)] flex items-center justify-center">
              <User size={15} className="text-[var(--neutral-600)]" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-5">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">
                  {activeTab === 'queue' ? 'Waiting Queue' : 'Patient History Lookup'}
                </h1>
                <p className="text-sm text-[var(--neutral-500)] mt-0.5">
                  {currentDoctor.name} &nbsp;·&nbsp; {currentDoctor.specialty}
                </p>
              </div>
              {inConsultation && (
                <button
                  onClick={() => navigate(`/doctor-patient/${inConsultation.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-700)] text-white text-xs font-medium rounded-md transition-colors"
                >
                  <Stethoscope size={14} />
                  Back to Patient
                </button>
              )}
            </div>

            {activeTab === 'queue' ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-white border border-[var(--neutral-200)] rounded-lg px-5 py-4">
                        <Icon size={16} className="text-[var(--neutral-400)] mb-3" />
                        <p className="text-2xl font-semibold text-[var(--neutral-900)] leading-none">{s.value}</p>
                        <p className="text-xs text-[var(--neutral-500)] mt-1.5">{s.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Queue table card */}
                <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
                  <div className="px-5 py-4 border-b border-[var(--neutral-100)] flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--neutral-900)]">Patients Waiting</p>
                    <span className="text-xs text-[var(--neutral-400)]">{waitingTokens.length} in queue</span>
                  </div>

                  {waitingTokens.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
                              {['#', 'Token', 'Patient', 'Age / Gender', 'Conditions', ''].map((h) => (
                                <th
                                  key={h}
                                  className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {waitingTokens.map((token, index) => {
                              const isNext = index === 0 && !inConsultation;
                              return (
                                <tr
                                  key={token.id}
                                  className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)] transition-colors"
                                >
                                  <td className="px-4 py-3 text-xs text-[var(--neutral-400)] font-mono">{index + 1}</td>
                                  <td className="px-4 py-3">
                                    <span className="font-mono text-xs font-semibold text-[var(--brand-700)] bg-[var(--brand-50)] px-2 py-0.5 rounded">
                                      {token.token}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-[var(--neutral-900)]">{token.patient.name}</p>
                                      {token.urgent && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 border border-[var(--error-200)] text-[var(--error-600)] bg-[var(--error-50)] rounded">
                                          <AlertCircle size={10} />
                                          Urgent
                                        </span>
                                      )}
                                      {isNext && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 border border-[var(--brand-200)] text-[var(--brand-700)] bg-[var(--brand-50)] rounded">
                                          Next
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-[var(--neutral-600)] text-xs">
                                    {token.patient.age} yrs · {token.patient.gender}
                                  </td>
                                  <td className="px-4 py-3">
                                    {token.patient.selectedConditions?.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {token.patient.selectedConditions.map((c: string) => (
                                          <span
                                            key={c}
                                            className="text-xs px-1.5 py-0.5 border border-[var(--neutral-200)] text-[var(--neutral-600)] rounded"
                                          >
                                            {c}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-[var(--neutral-400)]">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {isNext ? (
                                      <button
                                        onClick={() => handleStart(token.id, token.token)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--brand-500)] hover:bg-[var(--brand-700)] text-white text-xs font-medium rounded-md transition-colors"
                                      >
                                        Start Consultation
                                        <ArrowRight size={13} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => navigate(`/doctor-patient/${token.id}`)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-700)] hover:underline"
                                      >
                                        View
                                        <ArrowRight size={12} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-5 py-3 border-t border-[var(--neutral-100)]">
                        <p className="text-xs text-[var(--neutral-500)]">
                          {waitingTokens.length} patient{waitingTokens.length !== 1 ? 's' : ''} waiting
                          {doneCount > 0 && ` · ${doneCount} completed today`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-10 h-10 border border-[var(--neutral-200)] rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Users size={18} className="text-[var(--neutral-300)]" />
                      </div>
                      <p className="text-sm font-medium text-[var(--neutral-900)]">Queue is empty</p>
                      <p className="text-xs text-[var(--neutral-400)] mt-1">No patients waiting right now</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {selectedPatient ? (
                  <div className="space-y-4">
                    {/* Back header */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="p-1.5 border border-[var(--neutral-200)] rounded-md bg-white hover:bg-[var(--neutral-50)] text-[var(--neutral-600)] transition-colors"
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--neutral-900)]">{selectedPatient.name}</h2>
                        <p className="text-xs text-[var(--neutral-500)]">Mobile: {selectedPatient.mobile} &nbsp;·&nbsp; {selectedPatient.age} yrs &nbsp;·&nbsp; {selectedPatient.gender}</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--neutral-100)]">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-[var(--neutral-500)]" />
                          <h3 className="text-sm font-semibold text-[var(--neutral-900)]">Medical History Records</h3>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 border border-[var(--neutral-200)] text-[var(--neutral-600)] rounded-full">
                          {selectedPatientHistory.length} {selectedPatientHistory.length === 1 ? 'Record' : 'Records'}
                        </span>
                      </div>

                      {selectedPatientHistory.length === 0 ? (
                        <div className="py-12 text-center text-[var(--neutral-400)] text-sm">
                          No previous medical records found for this patient.
                        </div>
                      ) : (
                        <div className="relative pl-6 border-l border-[var(--neutral-200)] space-y-6 ml-2">
                          {selectedPatientHistory.map((h) => (
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
                              
                              <div className="h-4" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--neutral-400)]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search patient by name or mobile number..."
                        className="w-full pl-9 pr-4 py-2 border border-[var(--neutral-200)] rounded-md text-sm bg-white focus:outline-none focus:border-[var(--brand-500)] text-[var(--neutral-800)]"
                      />
                    </div>

                    {/* Patient grid list */}
                    <div className="bg-white border border-[var(--neutral-200)] rounded-lg overflow-hidden">
                      <div className="px-5 py-4 border-b border-[var(--neutral-100)] flex items-center justify-between">
                        <p className="text-sm font-medium text-[var(--neutral-900)]">Patient Directory</p>
                        <span className="text-xs text-[var(--neutral-400)]">{filteredPatients.length} registered</span>
                      </div>
                      {filteredPatients.length > 0 ? (
                        <div className="divide-y divide-[var(--neutral-100)]">
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.mobile}
                              onClick={() => handleSelectPatient(patient)}
                              className="px-5 py-3.5 hover:bg-[var(--neutral-50)] cursor-pointer flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--neutral-100)] flex items-center justify-center border border-[var(--neutral-200)]">
                                  <User size={14} className="text-[var(--neutral-600)]" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[var(--neutral-900)]">{patient.name}</p>
                                  <p className="text-xs text-[var(--neutral-400)] mt-0.5">Mobile: {patient.mobile} · {patient.age} yrs · {patient.gender}</p>
                                </div>
                              </div>
                              <button className="text-xs font-medium text-[var(--brand-700)] hover:underline flex items-center gap-1">
                                View History
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-sm text-[var(--neutral-400)]">
                          No patients match your search.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
