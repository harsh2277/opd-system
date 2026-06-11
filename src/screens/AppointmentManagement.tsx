import { useState } from 'react';
import { Input } from '../components/ui/input';
import {
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type ApptStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
type ApptType = 'consultation' | 'follow-up' | 'checkup' | 'emergency';
type FilterStatus = 'all' | ApptStatus;

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  mobile: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: ApptType;
  status: ApptStatus;
  notes: string;
}

const appointments: Appointment[] = [
  {
    id: 'APT001', patientName: 'Rajesh Kumar', patientId: 'P001', mobile: '98765 43210',
    doctor: 'Dr. Sharma', specialty: 'General Physician', date: '2026-06-08', time: '09:00',
    type: 'consultation', status: 'completed', notes: 'Follow-up for fever',
  },
  {
    id: 'APT002', patientName: 'Priya Patel', patientId: 'P002', mobile: '98765 43211',
    doctor: 'Dr. Patel', specialty: 'Cardiologist', date: '2026-06-08', time: '09:30',
    type: 'follow-up', status: 'completed', notes: 'Cardiac checkup review',
  },
  {
    id: 'APT003', patientName: 'Amit Singh', patientId: 'P003', mobile: '98765 43212',
    doctor: 'Dr. Kumar', specialty: 'Pediatrician', date: '2026-06-08', time: '10:00',
    type: 'checkup', status: 'scheduled', notes: 'Routine checkup',
  },
  {
    id: 'APT004', patientName: 'Sneha Reddy', patientId: 'P004', mobile: '91234 56789',
    doctor: 'Dr. Sharma', specialty: 'General Physician', date: '2026-06-08', time: '10:30',
    type: 'consultation', status: 'scheduled', notes: 'Migraine follow-up',
  },
  {
    id: 'APT005', patientName: 'Arjun Mehta', patientId: 'P005', mobile: '92345 67890',
    doctor: 'Dr. Singh', specialty: 'Dermatologist', date: '2026-06-08', time: '11:00',
    type: 'follow-up', status: 'scheduled', notes: 'Acne treatment review',
  },
  {
    id: 'APT006', patientName: 'Vikram Shah', patientId: 'P006', mobile: '93456 78901',
    doctor: 'Dr. Rao', specialty: 'ENT Specialist', date: '2026-06-08', time: '11:30',
    type: 'consultation', status: 'no-show', notes: 'Sinus issues',
  },
  {
    id: 'APT007', patientName: 'Meera Iyer', patientId: 'P007', mobile: '94567 89012',
    doctor: 'Dr. Mehta', specialty: 'Orthopedic', date: '2026-06-08', time: '12:00',
    type: 'consultation', status: 'cancelled', notes: 'Knee pain assessment',
  },
  {
    id: 'APT008', patientName: 'Rohit Verma', patientId: 'P008', mobile: '95678 90123',
    doctor: 'Dr. Patel', specialty: 'Cardiologist', date: '2026-06-08', time: '14:00',
    type: 'checkup', status: 'scheduled', notes: 'BP monitoring',
  },
  {
    id: 'APT009', patientName: 'Kavitha Nair', patientId: 'P009', mobile: '96789 01234',
    doctor: 'Dr. Kumar', specialty: 'Pediatrician', date: '2026-06-08', time: '14:30',
    type: 'consultation', status: 'scheduled', notes: 'Child vaccination',
  },
  {
    id: 'APT010', patientName: 'Suresh Babu', patientId: 'P010', mobile: '97890 12345',
    doctor: 'Dr. Sharma', specialty: 'General Physician', date: '2026-06-08', time: '15:00',
    type: 'emergency', status: 'scheduled', notes: 'Acute abdominal pain',
  },
];

const typeLabel: Record<ApptType, string> = {
  consultation: 'Consultation',
  'follow-up': 'Follow-up',
  checkup: 'Checkup',
  emergency: 'Emergency',
};

const typeBadge: Record<ApptType, string> = {
  consultation: 'bg-[var(--neutral-100)] text-[var(--neutral-700)] border-[var(--neutral-200)]',
  'follow-up': 'bg-[var(--teal-50)] text-[var(--teal-700)] border-[var(--teal-200)]',
  checkup: 'bg-[var(--neutral-50)] text-[var(--neutral-600)] border-[var(--neutral-200)]',
  emergency: 'bg-[var(--error-50)] text-[var(--error-700)] border-[var(--error-200)]',
};

const statusConfig: Record<ApptStatus, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  scheduled: {
    label: 'Scheduled',
    badge: 'bg-[var(--teal-50)] text-[var(--teal-700)] border-[var(--teal-200)]',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    badge: 'bg-[var(--success-50)] text-[var(--success-700)] border-[var(--success-200)]',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-[var(--neutral-50)] text-[var(--neutral-500)] border-[var(--neutral-200)]',
    icon: XCircle,
  },
  'no-show': {
    label: 'No Show',
    badge: 'bg-[var(--error-50)] text-[var(--error-700)] border-[var(--error-200)]',
    icon: AlertCircle,
  },
};

interface NewApptForm {
  patientName: string;
  mobile: string;
  doctor: string;
  date: string;
  time: string;
  type: ApptType;
  notes: string;
}

const emptyForm: NewApptForm = {
  patientName: '',
  mobile: '',
  doctor: '',
  date: '2026-06-08',
  time: '',
  type: 'consultation',
  notes: '',
};

const doctors = ['Dr. Sharma', 'Dr. Patel', 'Dr. Kumar', 'Dr. Singh', 'Dr. Mehta', 'Dr. Rao'];

export function AppointmentManagement() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState<NewApptForm>(emptyForm);

  const today = 'Monday, 8 June 2026';

  const filtered = appointments.filter((a) => {
    const matchQ =
      a.patientName.toLowerCase().includes(query.toLowerCase()) ||
      a.doctor.toLowerCase().includes(query.toLowerCase()) ||
      a.patientId.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || a.status === statusFilter;
    return matchQ && matchS;
  });

  const scheduled = appointments.filter((a) => a.status === 'scheduled').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
  const noShow = appointments.filter((a) => a.status === 'no-show').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--neutral-900)]">Appointments</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-0.5">Schedule and manage patient appointments</p>
        </div>
        <button
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white text-sm rounded-md transition-colors"
        >
          <Plus size={15} />
          New Appointment
        </button>
      </div>

      {/* Date Nav */}
      <div className="bg-white border border-[var(--neutral-200)] rounded-lg px-5 py-3 flex items-center justify-between">
        <button className="p-1.5 hover:bg-[var(--neutral-100)] rounded transition-colors">
          <ChevronLeft size={16} className="text-[var(--neutral-600)]" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-[var(--neutral-500)]" />
          <span className="text-sm font-medium text-[var(--neutral-900)]">{today}</span>
          <span className="text-xs text-[var(--neutral-400)] ml-1">— OPD Day</span>
        </div>
        <button className="p-1.5 hover:bg-[var(--neutral-100)] rounded transition-colors">
          <ChevronRight size={16} className="text-[var(--neutral-600)]" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Today', value: appointments.length, color: 'text-[var(--neutral-900)]' },
          { label: 'Scheduled', value: scheduled, color: 'text-[var(--teal-600)]' },
          { label: 'Completed', value: completed, color: 'text-[var(--success-600)]' },
          { label: 'Cancelled / No Show', value: cancelled + noShow, color: 'text-[var(--neutral-500)]' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[var(--neutral-200)] rounded-lg px-4 py-4">
            <p className="text-xs text-[var(--neutral-500)] mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
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
              placeholder="Search patient, doctor, or ID..."
              className="pl-9 text-sm h-9 border-[var(--neutral-200)]"
            />
          </div>
          <div className="flex items-center gap-1 ml-auto">
            {(['all', 'scheduled', 'completed', 'cancelled', 'no-show'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                  statusFilter === s
                    ? 'bg-[var(--neutral-900)] text-white'
                    : 'text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]'
                }`}
              >
                {s === 'no-show' ? 'No Show' : s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--neutral-100)] bg-[var(--neutral-50)]">
                {['Appt ID', 'Patient', 'Doctor', 'Time', 'Type', 'Status', 'Notes', ''].map((h) => (
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
              {filtered.map((a) => {
                const sc = statusConfig[a.status];
                const StatusIcon = sc.icon;
                return (
                  <tr
                    key={a.id}
                    className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-[var(--teal-600)] bg-[var(--teal-50)] px-2 py-0.5 rounded">
                        {a.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--neutral-100)] flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-[var(--neutral-500)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--neutral-900)]">{a.patientName}</p>
                          <p className="text-xs text-[var(--neutral-400)]">{a.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope size={12} className="text-[var(--neutral-400)]" />
                        <div>
                          <p className="text-[var(--neutral-800)]">{a.doctor}</p>
                          <p className="text-xs text-[var(--neutral-400)]">{a.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[var(--neutral-700)]">
                        <Clock size={12} className="text-[var(--neutral-400)]" />
                        {a.time}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${typeBadge[a.type]}`}>
                        {typeLabel[a.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border ${sc.badge}`}>
                        <StatusIcon size={11} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--neutral-500)] max-w-[160px] truncate">
                      {a.notes}
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'scheduled' && (
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-[var(--success-600)] hover:underline">Complete</button>
                          <button className="text-xs text-[var(--error-500)] hover:underline">Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--neutral-400)] text-sm">No appointments found</div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[var(--neutral-100)] flex items-center justify-between">
          <p className="text-xs text-[var(--neutral-500)]">
            Showing {filtered.length} of {appointments.length} appointments
          </p>
        </div>
      </div>

      {/* Side Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/20" onClick={() => setShowPanel(false)} />
          <div className="w-[420px] bg-white border-l border-[var(--neutral-200)] h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--neutral-200)]">
              <h2 className="text-base font-semibold text-[var(--neutral-900)]">New Appointment</h2>
              <button
                onClick={() => setShowPanel(false)}
                className="text-[var(--neutral-400)] hover:text-[var(--neutral-700)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Patient Name</label>
                <Input
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  placeholder="Full name"
                  className="h-9 text-sm border-[var(--neutral-200)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Mobile Number</label>
                <Input
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="10-digit number"
                  className="h-9 text-sm border-[var(--neutral-200)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Doctor</label>
                <select
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  className="w-full h-9 text-sm border border-[var(--neutral-200)] rounded-md px-3 bg-white text-[var(--neutral-900)] focus:outline-none focus:border-[var(--teal-400)]"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="h-9 text-sm border-[var(--neutral-200)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Time</label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="h-9 text-sm border-[var(--neutral-200)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Appointment Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ApptType })}
                  className="w-full h-9 text-sm border border-[var(--neutral-200)] rounded-md px-3 bg-white text-[var(--neutral-900)] focus:outline-none focus:border-[var(--teal-400)]"
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="checkup">Checkup</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Reason for visit..."
                  rows={3}
                  className="w-full text-sm border border-[var(--neutral-200)] rounded-md px-3 py-2 resize-none bg-white text-[var(--neutral-900)] focus:outline-none focus:border-[var(--teal-400)]"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--neutral-200)] flex gap-3">
              <button
                onClick={() => setShowPanel(false)}
                className="flex-1 px-4 py-2 text-sm border border-[var(--neutral-200)] text-[var(--neutral-700)] rounded-md hover:bg-[var(--neutral-50)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="flex-1 px-4 py-2 text-sm bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white rounded-md transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
