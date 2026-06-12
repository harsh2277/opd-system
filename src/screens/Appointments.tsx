import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Appointment } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle,
  XCircle,
  PlusCircle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00',
];

const today = new Date().toISOString().split('T')[0];

export function Appointments() {
  const navigate = useNavigate();
  const { doctors, appointments, addAppointment, updateAppointmentStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(today);
  const [filterStatus, setFilterStatus] = useState<'all' | Appointment['status']>('all');

  const [form, setForm] = useState({
    patientName: '',
    patientMobile: '',
    patientAge: '',
    patientGender: 'Male',
    doctorId: '',
    date: today,
    time: '09:00',
    notes: '',
  });

  const onDutyDoctors = doctors.filter(d => d.status === 'on-duty' || d.status === 'break' || d.status === 'lunch');

  const filtered = appointments
    .filter(a => (!filterDate || a.date === filterDate))
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .sort((a, b) => a.time.localeCompare(b.time));

  const counts = {
    scheduled: appointments.filter(a => a.date === filterDate && a.status === 'scheduled').length,
    arrived: appointments.filter(a => a.date === filterDate && a.status === 'arrived').length,
    cancelled: appointments.filter(a => a.date === filterDate && a.status === 'cancelled').length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim()) { toast.error('Enter patient name'); return; }
    if (!form.patientMobile || form.patientMobile.length !== 10) { toast.error('Enter valid 10-digit mobile'); return; }
    if (!form.doctorId) { toast.error('Select a doctor'); return; }

    const conflict = appointments.find(
      a => a.doctorId === form.doctorId && a.date === form.date && a.time === form.time && a.status !== 'cancelled'
    );
    if (conflict) {
      toast.error(`${conflict.patientName} already has this slot. Pick another time.`);
      return;
    }

    const doctor = doctors.find(d => d.id === form.doctorId)!;
    addAppointment({
      patientName: form.patientName.trim(),
      patientMobile: form.patientMobile,
      patientAge: form.patientAge,
      patientGender: form.patientGender,
      doctorId: form.doctorId,
      doctorName: doctor.name,
      date: form.date,
      time: form.time,
      notes: form.notes,
      status: 'scheduled',
    });
    toast.success(`Appointment booked for ${form.patientName} at ${form.time}`);
    setForm({ patientName: '', patientMobile: '', patientAge: '', patientGender: 'Male', doctorId: '', date: today, time: '09:00', notes: '' });
    setShowForm(false);
  };

  const statusBadge = (status: Appointment['status']) => {
    if (status === 'scheduled') return 'bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-700)]';
    if (status === 'arrived') return 'bg-[var(--success-50)] border-[var(--success-200)] text-[var(--success-700)]';
    return 'bg-[var(--neutral-100)] border-[var(--neutral-200)] text-[var(--neutral-500)] line-through';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--neutral-900)]">Appointments</h1>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">Pre-book patient slots before arrival</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs h-9">
          <PlusCircle size={14} />
          {showForm ? 'Cancel' : 'Book Appointment'}
          {showForm ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {([
          ['Scheduled', counts.scheduled, 'var(--brand-500)'],
          ['Arrived', counts.arrived, 'var(--success-500)'],
          ['Cancelled', counts.cancelled, 'var(--neutral-400)'],
        ] as const).map(([label, count, color]) => (
          <div key={label} className="bg-white border border-[var(--neutral-200)] rounded-lg p-4">
            <p className="text-2xl font-bold" style={{ color }}>{count}</p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">{label} today</p>
          </div>
        ))}
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="bg-white border border-[var(--brand-200)] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[var(--neutral-900)] mb-4 flex items-center gap-2">
            <Calendar size={15} className="text-[var(--brand-500)]" />
            New Appointment
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <Input
              label="Patient Name"
              value={form.patientName}
              onChange={e => setForm({ ...form, patientName: e.target.value })}
              placeholder="Full name"
              required
            />
            <Input
              label="Mobile Number"
              type="tel"
              value={form.patientMobile}
              onChange={e => setForm({ ...form, patientMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit mobile"
              required
            />
            <div>
              <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={form.patientAge}
                onChange={e => setForm({ ...form, patientAge: e.target.value })}
                placeholder="Age"
                className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-md focus:outline-none focus:border-[var(--brand-400)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Gender</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, patientGender: g })}
                    className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                      form.patientGender === g
                        ? 'border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)]'
                        : 'border-[var(--neutral-200)] text-[var(--neutral-600)] bg-white hover:bg-[var(--neutral-50)]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Doctor</label>
              <select
                value={form.doctorId}
                onChange={e => setForm({ ...form, doctorId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-md focus:outline-none focus:border-[var(--brand-400)] bg-white"
                required
              >
                <option value="">Select doctor</option>
                {onDutyDoctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                min={today}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-md focus:outline-none focus:border-[var(--brand-400)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Time Slot</label>
              <div className="flex flex-wrap gap-1.5">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, time: t })}
                    className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
                      form.time === t
                        ? 'border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)]'
                        : 'border-[var(--neutral-200)] text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--neutral-700)] mb-1.5">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Chief complaint or reason for visit"
                className="w-full px-3 py-2 text-sm border border-[var(--neutral-200)] rounded-md focus:outline-none focus:border-[var(--brand-400)]"
              />
            </div>
            <div className="col-span-2 pt-2">
              <Button type="submit" className="w-full h-10 text-sm font-semibold">
                Confirm Appointment
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-[var(--neutral-400)]" />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-[var(--neutral-200)] rounded-md focus:outline-none focus:border-[var(--brand-400)]"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'scheduled', 'arrived', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all capitalize ${
                filterStatus === s
                  ? 'border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)]'
                  : 'border-[var(--neutral-200)] text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment List */}
      <div className="bg-white border border-[var(--neutral-200)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--neutral-100)] bg-[var(--neutral-50)] flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--neutral-700)]">
            {filterDate === today ? "Today's" : filterDate} Appointments
          </span>
          <span className="text-xs text-[var(--neutral-500)]">{filtered.length} total</span>
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-[var(--neutral-100)]">
            {filtered.map(appt => (
              <div key={appt.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[var(--neutral-50)] transition-colors">
                <div className="w-14 text-center flex-shrink-0">
                  <p className="text-sm font-bold text-[var(--brand-700)]">{appt.time}</p>
                  <p className="text-[10px] text-[var(--neutral-400)]">slot</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-[var(--neutral-900)]">{appt.patientName}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${statusBadge(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--neutral-500)]">
                    <span className="flex items-center gap-1"><Phone size={10} />{appt.patientMobile}</span>
                    {appt.patientAge && <span className="flex items-center gap-1"><User size={10} />{appt.patientAge}y {appt.patientGender}</span>}
                    <span className="flex items-center gap-1"><Stethoscope size={10} />{appt.doctorName}</span>
                  </div>
                  {appt.notes && <p className="text-xs text-[var(--neutral-500)] mt-0.5 italic">{appt.notes}</p>}
                </div>

                {appt.status === 'scheduled' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { updateAppointmentStatus(appt.id, 'arrived'); toast.success(`${appt.patientName} marked as arrived`); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-md bg-[var(--success-50)] border border-[var(--success-200)] text-[var(--success-700)] hover:bg-[var(--success-100)] transition-colors"
                    >
                      <CheckCircle size={11} />
                      Arrived
                    </button>
                    <button
                      onClick={() => { updateAppointmentStatus(appt.id, 'cancelled'); toast.info(`Appointment cancelled`); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-md bg-white border border-[var(--neutral-200)] text-[var(--neutral-500)] hover:bg-[var(--neutral-50)] transition-colors"
                    >
                      <XCircle size={11} />
                      Cancel
                    </button>
                  </div>
                )}
                {appt.status === 'arrived' && (
                  <button
                    onClick={() => {
                      const doctor = doctors.find(d => d.id === appt.doctorId);
                      if (!doctor) return;
                      navigate('/doctor-selection', {
                        state: {
                          patient: {
                            name: appt.patientName,
                            mobile: appt.patientMobile,
                            age: appt.patientAge || '',
                            gender: appt.patientGender || 'Male',
                            bloodGroup: 'Not Known',
                            selectedConditions: [],
                            address: '',
                          },
                          isNew: false,
                          preselectedDoctorId: appt.doctorId,
                        },
                      });
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-md bg-[var(--brand-50)] border border-[var(--brand-200)] text-[var(--brand-700)] hover:bg-[var(--brand-100)] transition-colors"
                  >
                    Issue Token
                    <ArrowRight size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center gap-3 text-center text-[var(--neutral-400)]">
            <Calendar size={32} className="text-[var(--neutral-300)]" />
            <p className="text-sm">No appointments for this date</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-semibold text-[var(--brand-600)] hover:underline flex items-center gap-1"
            >
              <PlusCircle size={12} />
              Book the first appointment →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
