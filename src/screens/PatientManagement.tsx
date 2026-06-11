import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Download, Phone, Mail, Calendar, Eye, X, Clock, AlertCircle } from 'lucide-react';
import { getAllPatientsWithHistory } from '../data/dummyPatientHistory';

const allDummy = getAllPatientsWithHistory();

const initialPatients = [
  ...allDummy.map((p, idx) => ({
    id: `P00${idx + 1}`,
    name: p.patientName,
    mobile: p.mobile,
    email: `${p.patientName.toLowerCase().replace(' ', '.')}@email.com`,
    age: [45, 32, 28, 29, 35][idx] ?? 30,
    gender: idx % 2 === 0 ? 'Male' : 'Female',
    bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-'][idx % 5],
    lastVisit: p.history[0]?.date ? new Date(p.history[0].date).toLocaleDateString('en-IN') : '—',
    visits: p.history.length,
    selectedConditions: [['Hypertension'], ['Diabetes'], ['Asthma'], [], ['Thyroid']][idx] ?? [],
  })),
  {
    id: 'P006',
    name: 'Vikram Shah',
    mobile: '9345678901',
    email: 'vikram.shah@email.com',
    age: 52,
    gender: 'Male',
    bloodGroup: 'A-',
    lastVisit: '15/03/2026',
    visits: 8,
    selectedConditions: ['Diabetes', 'Hypertension'],
  },
  {
    id: 'P007',
    name: 'Meera Iyer',
    mobile: '9456789012',
    email: 'meera.iyer@email.com',
    age: 38,
    gender: 'Female',
    bloodGroup: 'B+',
    lastVisit: '28/02/2026',
    visits: 5,
    selectedConditions: [],
  },
  {
    id: 'P008',
    name: 'Rohit Verma',
    mobile: '9567890123',
    email: 'rohit.verma@email.com',
    age: 41,
    gender: 'Male',
    bloodGroup: 'O+',
    lastVisit: '10/12/2025',
    visits: 2,
    selectedConditions: ['Asthma'],
  },
];

export function PatientManagement() {
  const [patientList, setPatientList] = useState(initialPatients);
  const [query, setQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [patientForm, setPatientForm] = useState({
    name: '',
    mobile: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
  });

  const filtered = patientList.filter((p) => {
    return (
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.mobile.includes(query) ||
      p.id.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleOpenHistory = (patient: any) => {
    setSelectedPatient(patient);
    const saved = localStorage.getItem(`patient-history-${patient.mobile}`);
    const savedHistory = saved ? JSON.parse(saved) : [];
    const dummy = allDummy.find((p) => p.mobile === patient.mobile)?.history || [];
    setHistoryRecords([...savedHistory, ...dummy]);
  };

  const handleAddPatient = () => {
    if (!patientForm.name.trim() || !patientForm.mobile.trim()) return;

    setPatientList((prev) => [
      {
        id: `P${String(prev.length + 1).padStart(3, '0')}`,
        name: patientForm.name.trim(),
        mobile: patientForm.mobile.trim(),
        email: patientForm.email.trim() || '—',
        age: Number(patientForm.age) || 0,
        gender: patientForm.gender || '—',
        bloodGroup: patientForm.bloodGroup || '—',
        lastVisit: '—',
        visits: 0,
        selectedConditions: [],
      },
      ...prev,
    ]);
    setPatientForm({ name: '', mobile: '', email: '', age: '', gender: '', bloodGroup: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Patient Records</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-0.5">All registered patients and visit history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="line"
            className="flex items-center gap-1.5 text-xs px-3 py-2 h-9 border border-[var(--neutral-200)] text-[var(--neutral-700)] rounded-md hover:bg-[var(--neutral-50)]"
          >
            <Download size={14} />
            Export
          </Button>
          <Button
            onClick={() => setShowAddForm((value) => !value)}
            variant="primary"
            className="text-xs px-4 py-2 h-9 rounded-md"
          >
            {showAddForm ? 'Close Form' : 'Add Patient'}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
          <p className="text-sm font-medium text-[var(--neutral-900)] mb-4">Add New Patient</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Name" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} />
            <Input label="Mobile" value={patientForm.mobile} onChange={(e) => setPatientForm({ ...patientForm, mobile: e.target.value })} />
            <Input label="Email" value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
            <Input label="Age" type="number" value={patientForm.age} onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })} />
            <Input label="Gender" value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })} />
            <Input label="Blood Group" value={patientForm.bloodGroup} onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddPatient} variant="primary" size="sm" className="text-xs">
              Save Patient
            </Button>
          </div>
        </div>
      )}

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Patients', value: patientList.length, color: 'text-[var(--neutral-900)]' },
          { label: 'Visits Recorded', value: patientList.reduce((acc, p) => acc + p.visits, 0), color: 'text-[var(--brand-600)]' },
          { label: 'Returning Rate', value: '89%', color: 'text-[var(--teal-600)]' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[var(--neutral-200)] rounded-lg px-4 py-3">
            <p className="text-xs text-[var(--neutral-500)] mb-1">{s.label}</p>
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--neutral-100)]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, mobile, or ID..."
              className="pl-9 text-xs h-9 border-[var(--neutral-200)] focus:border-[var(--teal-400)]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
                {['Patient ID', 'Name', 'Contact', 'Age / Gender', 'Blood', 'Last Visit', 'Visits', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-[var(--teal-600)] bg-[var(--teal-50)] px-2 py-0.5 rounded">
                      {p.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--neutral-900)]">{p.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[var(--neutral-700)] text-xs">
                      <Phone size={11} className="text-[var(--neutral-400)]" />
                      {p.mobile}
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--neutral-400)] text-[10px] mt-0.5">
                      <Mail size={11} />
                      {p.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--neutral-700)] text-xs">
                    {p.age} / {p.gender}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 border border-[var(--neutral-200)] rounded text-[var(--neutral-700)]">
                      {p.bloodGroup}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-[var(--neutral-600)] text-xs">
                      <Calendar size={11} className="text-[var(--neutral-400)]" />
                      {p.lastVisit}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-[var(--neutral-700)] text-xs">{p.visits}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleOpenHistory(p)}
                      className="flex items-center gap-1 text-xs text-[var(--teal-600)] hover:underline font-medium"
                    >
                      <Eye size={13} />
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--neutral-400)] text-sm">No patients found</div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--neutral-100)]">
          <p className="text-xs text-[var(--neutral-500)]">
            Showing {filtered.length} of {patientList.length} records
          </p>
          <div className="flex items-center gap-1">
            {[1].map((n) => (
              <button
                key={n}
                className="w-7 h-7 text-xs rounded bg-[var(--neutral-900)] text-white"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Timeline Popup Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setSelectedPatient(null)}
          />
          {/* Modal box */}
          <div className="relative bg-white border border-[var(--neutral-200)] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--neutral-200)] sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-semibold text-[var(--neutral-900)]">
                  {selectedPatient.name} — Detailed Record
                </h3>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                  Patient ID: {selectedPatient.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1 text-[var(--neutral-400)] hover:text-[var(--neutral-700)] rounded hover:bg-[var(--neutral-100)] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Detailed Patient Information Grid */}
              <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-lg p-4">
                <p className="text-xs font-semibold text-[var(--neutral-700)] uppercase tracking-wider mb-3">Patient Demographics & Vitals</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--neutral-400)] block">Mobile Number</span>
                    <span className="font-medium text-[var(--neutral-800)]">{selectedPatient.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[var(--neutral-400)] block">Email Address</span>
                    <span className="font-medium text-[var(--neutral-800)]">{selectedPatient.email}</span>
                  </div>
                  <div>
                    <span className="text-[var(--neutral-400)] block">Age / Gender</span>
                    <span className="font-medium text-[var(--neutral-800)]">{selectedPatient.age} yrs · {selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[var(--neutral-400)] block">Blood Group</span>
                    <span className="font-medium text-[var(--neutral-800)] bg-white px-2 py-0.5 border border-[var(--neutral-200)] rounded inline-block mt-0.5">{selectedPatient.bloodGroup}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[var(--neutral-400)] block mb-1">Pre-existing Conditions</span>
                    {selectedPatient.selectedConditions?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.selectedConditions.map((c: string) => (
                          <span key={c} className="px-1.5 py-0.5 border border-[var(--error-200)] text-[var(--error-600)] bg-[var(--error-50)] rounded text-[10px] font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[var(--neutral-500)] italic">None declared</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-[var(--neutral-700)] uppercase tracking-wider mb-4">Consultation Visit History</p>
                {historyRecords.length === 0 ? (
                  <div className="py-12 text-center text-[var(--neutral-400)] text-sm">
                    No medical visits registered for this patient.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-[var(--neutral-200)] space-y-6 ml-2">
                    {historyRecords.map((h) => (
                      <div key={h.id} className="relative">
                        {/* Timeline dot */}
                        <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[var(--brand-500)] bg-white flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-500)]" />
                        </span>

                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-semibold text-[var(--brand-700)] bg-[var(--brand-50)] px-2 py-0.5 rounded border border-[var(--brand-200)]">
                              {h.doctor}
                            </span>
                            {h.specialty && (
                              <span className="text-xs text-[var(--neutral-500)] ml-2">
                                ({h.specialty})
                              </span>
                            )}
                            <p className="text-[10px] text-[var(--neutral-400)] mt-1.5 flex items-center gap-1">
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
                            <div className="bg-white border border-[var(--neutral-200)] rounded-md p-3">
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
                            <div className="flex flex-wrap gap-3 pt-2">
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
                        <div className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--neutral-200)] flex justify-end bg-[var(--neutral-50)] sticky bottom-0">
              <Button variant="line" size="sm" onClick={() => setSelectedPatient(null)} className="h-8 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
