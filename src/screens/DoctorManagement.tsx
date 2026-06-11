import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Search,
  Phone,
  Mail,
  Stethoscope,
  Users,
  Clock,
  CircleDot,
  Plus,
} from 'lucide-react';

type StatusFilter = 'all' | 'on-duty' | 'off-duty';

const doctorMeta: Record<string, { phone: string; email: string; department: string; experience: number }> = {
  D001: { phone: '98701 11001', email: 'sharma@hospital.com', department: 'General Medicine', experience: 12 },
  D002: { phone: '98701 11002', email: 'patel@hospital.com', department: 'Cardiology', experience: 9 },
  D003: { phone: '98701 11003', email: 'kumar@hospital.com', department: 'Pediatrics', experience: 7 },
  D004: { phone: '98701 11004', email: 'singh@hospital.com', department: 'Dermatology', experience: 6 },
  D005: { phone: '98701 11005', email: 'mehta@hospital.com', department: 'Orthopedics', experience: 14 },
  D006: { phone: '98701 11006', email: 'rao@hospital.com', department: 'ENT', experience: 11 },
};

const defaultMeta = { phone: '—', email: '—', department: 'General', experience: 0 };

export function DoctorManagement() {
  const { doctors, addDoctor } = useApp();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialty: '',
    avgWait: '15',
  });

  const augmented = doctors.map((d) => ({
    ...d,
    ...(doctorMeta[d.id] ?? defaultMeta),
  }));

  const onDuty = augmented.filter((d) => d.status === 'on-duty').length;
  const offDuty = augmented.filter((d) => d.status !== 'on-duty').length;
  const totalPatients = augmented.reduce((sum, d) => sum + d.queue, 0);

  const filtered = augmented.filter((d) => {
    const matchQ =
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialty.toLowerCase().includes(query.toLowerCase()) ||
      d.department.toLowerCase().includes(query.toLowerCase());
    const matchS =
      statusFilter === 'all' ||
      (statusFilter === 'on-duty' && d.status === 'on-duty') ||
      (statusFilter === 'off-duty' && d.status !== 'on-duty');
    return matchQ && matchS;
  });

  const stats = [
    { label: 'Total Doctors', value: doctors.length, icon: Stethoscope },
    { label: 'On Duty', value: onDuty, icon: CircleDot },
    { label: 'Off Duty', value: offDuty, icon: Clock },
    { label: 'Patients in Queue', value: totalPatients, icon: Users },
  ];

  const nextDoctorId = `D${String(
    doctors.reduce((max, doctor) => {
      const number = Number(doctor.id.replace(/\D/g, ''));
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0) + 1
  ).padStart(3, '0')}`;

  const handleAddDoctor = () => {
    if (!doctorForm.name.trim() || !doctorForm.specialty.trim()) return;

    addDoctor({
      id: nextDoctorId,
      name: doctorForm.name.trim(),
      specialty: doctorForm.specialty.trim(),
      queue: 0,
      avgWait: Number(doctorForm.avgWait) || 15,
      status: 'off-duty',
    });
    setDoctorForm({ name: '', specialty: '', avgWait: '15' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Doctors Roster</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-0.5">View active doctor profiles, specialties, and duty status</p>
        </div>
        <Button onClick={() => setShowAddForm((value) => !value)} variant="primary" size="sm" className="text-xs">
          <Plus size={14} />
          {showAddForm ? 'Close Form' : 'Add Doctor'}
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-[var(--neutral-200)] rounded-lg p-5">
          <p className="text-sm font-medium text-[var(--neutral-900)] mb-4">Add New Doctor</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Doctor Name" value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} />
            <Input label="Specialty" value={doctorForm.specialty} onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })} />
            <Input label="Avg Wait (min)" type="number" value={doctorForm.avgWait} onChange={(e) => setDoctorForm({ ...doctorForm, avgWait: e.target.value })} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddDoctor} variant="primary" size="sm" className="text-xs">
              Save Doctor
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
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
              placeholder="Search by name, specialty, department..."
              className="pl-9 text-xs h-9 border-[var(--neutral-200)] focus:border-[var(--teal-400)]"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            {(['all', 'on-duty', 'off-duty'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-[var(--neutral-900)] text-white'
                    : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'
                }`}
              >
                {s === 'all' ? 'All' : s === 'on-duty' ? 'On Duty' : 'Off Duty'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
                {['ID', 'Doctor', 'Department', 'Contact', 'Exp.', 'Patients Today', 'Avg Wait', 'Status'].map(
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
              {filtered.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-[var(--teal-600)] bg-[var(--teal-50)] px-2 py-0.5 rounded">
                      {doc.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--neutral-900)] text-xs">{doc.name}</p>
                    <p className="text-[10px] text-[var(--neutral-500)] mt-0.5">{doc.specialty}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--neutral-700)] text-xs">{doc.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[var(--neutral-700)] text-xs">
                      <Phone size={11} className="text-[var(--neutral-400)]" />
                      {doc.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--neutral-400)] mt-0.5">
                      <Mail size={11} />
                      {doc.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--neutral-700)] text-xs">{doc.experience}y</td>
                  <td className="px-4 py-3 text-[var(--neutral-700)] text-xs">{doc.queue}</td>
                  <td className="px-4 py-3 text-[var(--neutral-700)] text-xs">{doc.avgWait} min</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border ${
                        doc.status === 'on-duty'
                          ? 'border-[var(--success-200)] text-[var(--success-700)] bg-[var(--success-50)]'
                          : 'border-[var(--neutral-200)] text-[var(--neutral-500)] bg-[var(--neutral-50)]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          doc.status === 'on-duty' ? 'bg-[var(--success-500)]' : 'bg-[var(--neutral-400)]'
                        }`}
                      />
                      {doc.status === 'on-duty' ? 'On Duty' : 'Off Duty'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--neutral-400)] text-sm">No doctors found</div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[var(--neutral-100)]">
          <p className="text-xs text-[var(--neutral-500)]">
            Showing {filtered.length} of {doctors.length} doctors
          </p>
        </div>
      </div>
    </div>
  );
}
