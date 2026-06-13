import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Clock, ArrowRight, AlertCircle, User, Search, ArrowLeft,
  FlaskConical, Activity, Stethoscope,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { getPatientHistory } from '../data/dummyPatientHistory';
import { DoctorLayout } from '../components/DoctorLayout';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tokens, updateTokenStatus } = useApp();
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);

  const view = searchParams.get('view') === 'history' ? 'history' : 'queue';

  useEffect(() => {
    const data = localStorage.getItem('current-doctor');
    if (!data) { toast.error('Please login first'); navigate('/'); return; }
    setCurrentDoctor(JSON.parse(data));
  }, [navigate]);

  if (!currentDoctor) return null;

  const mine = tokens.filter(t => t.doctor.id === currentDoctor.id);
  const inConsult = mine.find(t => t.status === 'in-consultation');
  // Lab-return patients flip back to 'waiting' after lab completes, but labStatus stays 'completed'
  // so we must detect them by labStatus, not by token status
  const labReady = mine.filter(t => t.labStatus === 'completed' && (t.status === 'waiting' || t.status === 'lab-pending'));
  const labReadyIds = new Set(labReady.map(t => t.id));
  const waiting = mine.filter(t => t.status === 'waiting' && !labReadyIds.has(t.id));
  const atLab = mine.filter(t => t.status === 'lab-pending' && t.labStatus !== 'completed');
  const done = mine.filter(t => t.status === 'done');

  const callPatient = (tokenId: string, tokenNumber: string) => {
    if (inConsult) { toast.error('Finish the current consultation first'); return; }
    updateTokenStatus(tokenNumber, 'in-consultation');
    navigate(`/doctor-patient/${tokenId}`);
  };

  const allPatients = Array.from(new Map(tokens.map(t => [t.patient.mobile, t.patient])).values());
  const filteredPatients = allPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.mobile.includes(searchQuery)
  );

  const breadcrumb = view === 'queue' ? 'Queue' : 'Patient History';

  return (
    <DoctorLayout breadcrumb={breadcrumb}>
      {view === 'queue' ? (
        <div className="space-y-4 max-w-5xl mx-auto">

          {/* ── Page title ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--neutral-900)]">
                {currentDoctor.name}'s Queue
              </h1>
              <p className="text-sm text-[var(--neutral-500)] mt-0.5">{currentDoctor.specialty}</p>
            </div>
            {inConsult && (
              <button
                onClick={() => navigate(`/doctor-patient/${inConsult.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-700)] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Activity size={14} />
                Return to Patient
              </button>
            )}
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Waiting', val: waiting.length, color: 'brand' },
              { label: 'In Consultation', val: inConsult ? 1 : 0, color: 'teal' },
              { label: 'At Lab', val: atLab.length + labReady.length, color: labReady.length > 0 ? 'teal' : 'gray' },
              { label: 'Done Today', val: done.length, color: done.length > 0 ? 'green' : 'gray' },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border px-4 py-3.5 ${
                s.color === 'brand' && s.val > 0 ? 'bg-[var(--brand-50)] border-[var(--brand-200)]' :
                s.color === 'teal' && s.val > 0 ? 'bg-[var(--teal-50)] border-[var(--teal-200)]' :
                s.color === 'green' && s.val > 0 ? 'bg-[var(--success-50)] border-[var(--success-200)]' :
                'bg-white border-[var(--neutral-200)]'
              }`}>
                <p className={`text-2xl font-bold ${
                  s.color === 'brand' && s.val > 0 ? 'text-[var(--brand-700)]' :
                  s.color === 'teal' && s.val > 0 ? 'text-[var(--teal-700)]' :
                  s.color === 'green' && s.val > 0 ? 'text-[var(--success-700)]' :
                  'text-[var(--neutral-600)]'
                }`}>{s.val}</p>
                <p className="text-xs text-[var(--neutral-500)] mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Currently consulting ── */}
          {inConsult && (
            <div
              onClick={() => navigate(`/doctor-patient/${inConsult.id}`)}
              className="flex items-center gap-4 px-5 py-4 bg-[var(--brand-500)] rounded-lg cursor-pointer hover:bg-[var(--brand-600)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Stethoscope size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Now Consulting</p>
                <p className="text-base font-bold text-white mt-0.5">{inConsult.patient.name}</p>
                <p className="text-xs text-white/70 mt-0.5">
                  {inConsult.token} · {inConsult.patient.age} yrs · {inConsult.patient.gender}
                  {inConsult.labStatus === 'completed' && ' · Lab results ready ✓'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm font-semibold group-hover:text-white">
                Open <ArrowRight size={15} />
              </div>
            </div>
          )}

          {/* ── Lab results ready — HIGH PRIORITY ── */}
          {labReady.length > 0 && (
            <div className="rounded-lg border-2 border-[var(--teal-400)] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-[var(--teal-500)]">
                <FlaskConical size={16} className="text-white flex-shrink-0" />
                <p className="text-sm font-bold text-white flex-1">Lab Results Ready — Review Required</p>
                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                  {labReady.length} patient{labReady.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="bg-white divide-y divide-[var(--neutral-100)]">
                {labReady.map(t => (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--teal-50)] transition-colors">
                    <span className="font-mono text-xs font-bold text-[var(--teal-700)] bg-[var(--teal-50)] border border-[var(--teal-200)] px-2.5 py-1 rounded-md flex-shrink-0">
                      {t.token}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--neutral-900)]">{t.patient.name}</p>
                      <p className="text-xs text-[var(--neutral-500)] mt-0.5 truncate">
                        {(t.labTests || []).map((x: any) => x.name).join(' · ')}
                      </p>
                    </div>
                    {t.labCompletedAt && (
                      <p className="text-[10px] text-[var(--neutral-400)] flex-shrink-0 hidden md:block">
                        {new Date(t.labCompletedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    <button
                      onClick={() => callPatient(t.id, t.token)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
                    >
                      Review Report <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Urgent banner ── */}
          {waiting.some(t => t.urgent) && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--error-50)] border border-[var(--error-300)] rounded-lg">
              <AlertCircle size={15} className="text-[var(--error-500)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--error-700)]">
                  {waiting.filter(t => t.urgent).length} urgent patient{waiting.filter(t => t.urgent).length > 1 ? 's' : ''} waiting
                </p>
                <p className="text-[11px] text-[var(--error-600)] mt-0.5 truncate">
                  {waiting.filter(t => t.urgent).map(t => `${t.patient.name} (${t.token})`).join('  ·  ')}
                </p>
              </div>
            </div>
          )}

          {/* ── Waiting queue ── */}
          <div className="bg-white border border-[var(--neutral-200)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--neutral-100)]">
              <p className="text-sm font-bold text-[var(--neutral-900)]">Waiting Queue</p>
              <span className="text-xs text-[var(--neutral-400)]">
                {waiting.length} patient{waiting.length !== 1 ? 's' : ''}
              </span>
            </div>

            {waiting.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
                    {['#', 'Token', 'Patient', 'Age · Gender', 'Known Conditions', ''].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waiting.map((t, idx) => {
                    const isNext = idx === 0 && !inConsult;
                    return (
                      <tr key={t.id} className={`border-b border-[var(--neutral-100)] last:border-0 transition-colors ${isNext ? 'bg-[var(--brand-50)]' : 'hover:bg-[var(--neutral-50)]'}`}>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            isNext ? 'bg-[var(--brand-500)] text-white' : 'bg-[var(--neutral-100)] text-[var(--neutral-500)]'
                          }`}>{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`font-mono text-xs font-bold px-2 py-1 rounded-md ${
                            isNext ? 'bg-[var(--brand-100)] border border-[var(--brand-300)] text-[var(--brand-800)]' : 'bg-[var(--neutral-100)] text-[var(--neutral-600)]'
                          }`}>{t.token}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm text-[var(--neutral-900)]">{t.patient.name}</p>
                            {t.urgent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[var(--error-50)] border border-[var(--error-200)] text-[var(--error-600)] rounded-full flex items-center gap-0.5">
                                <AlertCircle size={8} /> Urgent
                              </span>
                            )}
                            {isNext && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[var(--brand-500)] text-white rounded-full">Next</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[var(--neutral-500)] whitespace-nowrap">
                          {t.patient.age} yrs · {t.patient.gender}
                        </td>
                        <td className="px-4 py-3.5">
                          {t.patient.selectedConditions?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {t.patient.selectedConditions.map((c: string) => (
                                <span key={c} className="text-[9px] px-1.5 py-0.5 bg-[var(--neutral-100)] border border-[var(--neutral-200)] text-[var(--neutral-600)] rounded-md">{c}</span>
                              ))}
                            </div>
                          ) : <span className="text-xs text-[var(--neutral-300)]">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {inConsult ? (
                            <span className="text-xs text-[var(--neutral-400)]">In queue</span>
                          ) : (
                            <button
                              onClick={() => callPatient(t.id, t.token)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                isNext
                                  ? 'bg-[var(--brand-500)] hover:bg-[var(--brand-700)] text-white'
                                  : 'border border-[var(--neutral-200)] text-[var(--neutral-600)] hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]'
                              }`}
                            >
                              {isNext ? 'Call Patient' : 'Call'} <ArrowRight size={11} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-16 flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-lg border-2 border-dashed border-[var(--neutral-200)] flex items-center justify-center">
                  <Users size={20} className="text-[var(--neutral-300)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--neutral-700)]">Queue is empty</p>
                <p className="text-xs text-[var(--neutral-400)]">No patients waiting right now</p>
              </div>
            )}
          </div>

          {/* ── At lab ── */}
          {atLab.length > 0 && (
            <div className="bg-white border border-[var(--neutral-200)] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--neutral-100)]">
                <FlaskConical size={13} className="text-[var(--neutral-400)]" />
                <p className="text-sm font-medium text-[var(--neutral-600)]">At Lab — Awaiting Results</p>
                <span className="ml-auto text-xs text-[var(--neutral-400)]">{atLab.length}</span>
              </div>
              <div className="divide-y divide-[var(--neutral-100)]">
                {atLab.map(t => (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="font-mono text-xs font-semibold text-[var(--neutral-500)] bg-[var(--neutral-50)] border border-[var(--neutral-200)] px-2 py-0.5 rounded-md flex-shrink-0">{t.token}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--neutral-700)]">{t.patient.name}</p>
                      <p className="text-xs text-[var(--neutral-400)] mt-0.5 truncate">{(t.labTests || []).map((x: any) => x.name).join(' · ')}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--neutral-400)] flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning-400)] animate-pulse" />
                      Processing
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ── History view ── */
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-[var(--neutral-900)]">Patient History</h1>
          {selectedPatient ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-sm text-[var(--neutral-600)] hover:text-[var(--neutral-900)]">
                <ArrowLeft size={14} /> Back to directory
              </button>
              <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-6">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--neutral-100)]">
                  <div>
                    <h2 className="text-base font-bold text-[var(--neutral-900)]">{selectedPatient.name}</h2>
                    <p className="text-xs text-[var(--neutral-500)] mt-0.5">{selectedPatient.mobile} · {selectedPatient.age} yrs · {selectedPatient.gender}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 border border-[var(--neutral-200)] rounded-full text-[var(--neutral-600)]">
                    {selectedHistory.length} records
                  </span>
                </div>
                {selectedHistory.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[var(--neutral-400)]">No records found.</p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-[var(--neutral-100)] space-y-6 ml-2">
                    {selectedHistory.map((h: any) => (
                      <div key={h.id} className="relative">
                        <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[var(--brand-400)] bg-white flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-400)]" />
                        </span>
                        <p className="text-[10px] text-[var(--neutral-400)] mb-1">
                          {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {' · '}{h.doctor}
                        </p>
                        <p className="text-sm font-semibold text-[var(--neutral-800)]">{h.diagnosis}</p>
                        {h.prescription && <p className="text-xs text-[var(--neutral-500)] mt-1 whitespace-pre-line">{h.prescription}</p>}
                        {h.vitals && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {[['BP', h.vitals.bp], ['Temp', h.vitals.temp], ['Pulse', h.vitals.pulse]].map(([l, v]) => v ? (
                              <span key={l} className="text-[10px] font-semibold bg-[var(--neutral-100)] text-[var(--neutral-600)] px-2 py-0.5 rounded-md">{l}: {v}</span>
                            ) : null)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[var(--neutral-400)]" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or mobile..."
                  className="w-full pl-9 pr-4 py-2 border border-[var(--neutral-200)] rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--brand-400)]" />
              </div>
              <div className="bg-white border border-[var(--neutral-200)] rounded-lg overflow-hidden">
                {filteredPatients.length > 0 ? (
                  <div className="divide-y divide-[var(--neutral-100)]">
                    {filteredPatients.map(p => (
                      <div key={p.mobile} onClick={() => {
                        setSelectedPatient(p);
                        const s = localStorage.getItem(`patient-history-${p.mobile}`);
                        setSelectedHistory([...(s ? JSON.parse(s) : []), ...(getPatientHistory(p.mobile) || [])]);
                      }} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--neutral-50)] cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--neutral-100)] border border-[var(--neutral-200)] flex items-center justify-center flex-shrink-0">
                            <User size={13} className="text-[var(--neutral-500)]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--neutral-900)]">{p.name}</p>
                            <p className="text-xs text-[var(--neutral-400)]">{p.mobile} · {p.age} yrs · {p.gender}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[var(--neutral-400)]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-[var(--neutral-400)]">No patients found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DoctorLayout>
  );
}
