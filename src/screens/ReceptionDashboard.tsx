import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Stethoscope,
  CheckCircle2,
  UserPlus,
  ListChecks,
  FileText,
  ArrowUpRight,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useApp, Token } from '../context/AppContext';

const activityDotColor: Record<string, string> = {
  new: 'bg-[var(--brand-500)]',
  done: 'bg-[var(--success-500)]',
  urgent: 'bg-[var(--error-500)]',
  info: 'bg-[var(--neutral-400)]',
};

function formatRelativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min ago`;
  const h = Math.floor(diff / 60);
  return `${h}h ago`;
}

function deriveActivity(tokens: Token[]) {
  const events: { id: string; text: string; name: string; time: string; type: string; ts: number }[] = [];

  tokens.forEach((t) => {
    // Check-in event
    events.push({
      id: `checkin-${t.id}`,
      text: t.isNewPatient ? 'New patient registered' : 'Returning patient checked in',
      name: t.patient.name,
      time: formatRelativeTime(t.issuedAt),
      type: 'new',
      ts: new Date(t.issuedAt).getTime(),
    });
    // Urgent flag
    if (t.urgent) {
      events.push({
        id: `urgent-${t.id}`,
        text: 'Patient marked urgent',
        name: t.patient.name,
        time: formatRelativeTime(t.issuedAt),
        type: 'urgent',
        ts: new Date(t.issuedAt).getTime() + 1,
      });
    }
    // Consultation completed
    if (t.status === 'done') {
      events.push({
        id: `done-${t.id}`,
        text: 'Consultation completed',
        name: t.patient.name,
        time: formatRelativeTime(t.issuedAt),
        type: 'done',
        ts: new Date(t.issuedAt).getTime() + 2,
      });
    }
  });

  return events.sort((a, b) => b.ts - a.ts).slice(0, 6);
}

export function ReceptionDashboard() {
  const navigate = useNavigate();
  const { tokens, doctors, sessionStartTime, startSession } = useApp();
  const [, setTick] = useState(0);

  // Refresh relative timestamps every 60 s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const waiting = tokens.filter((t) => t.status === 'waiting').length;
  const inConsultation = tokens.filter((t) => t.status === 'in-consultation').length;
  const completed = tokens.filter((t) => t.status === 'done').length;
  const onDuty = doctors.filter((d) => d.status === 'on-duty').length;

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stats = [
    {
      label: 'Total Patients Today',
      value: tokens.length,
      sub: tokens.length === 0 ? 'No check-ins yet' : `${tokens.length} token${tokens.length !== 1 ? 's' : ''} issued`,
      icon: Users,
      trend: tokens.length > 0,
    },
    {
      label: 'Currently Waiting',
      value: waiting,
      sub: `${inConsultation} in consultation`,
      icon: Clock,
      trend: false,
    },
    {
      label: 'Doctors on Duty',
      value: `${onDuty}/${doctors.length}`,
      sub: `${doctors.length - onDuty} off duty`,
      icon: Stethoscope,
      trend: false,
    },
    {
      label: 'Completed Today',
      value: completed,
      sub: completed === 0 ? 'None completed yet' : `${completed} of ${tokens.length} done`,
      icon: CheckCircle2,
      trend: completed > 0,
    },
  ];

  const quickActions = [
    {
      label: 'New Check-in',
      icon: UserPlus,
      path: '/patient-type',
      desc: 'Register new or returning patient',
    },
    {
      label: 'Manage Queue',
      icon: ListChecks,
      path: '/queue',
      desc: 'View and control patient queue',
    },
    {
      label: 'Patient Records',
      icon: FileText,
      path: '/patients',
      desc: 'Search and view patient history',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--neutral-900)]">Dashboard</h1>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            {todayLabel}&nbsp;&nbsp;·&nbsp;&nbsp;{sessionStartTime ? 'OPD Session Active' : 'No Session Started'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!sessionStartTime && (
            <button
              onClick={startSession}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--success-600)] hover:bg-[var(--success-700)] text-white text-xs font-medium rounded-md transition-colors"
            >
              <Play size={14} />
              Start Session
            </button>
          )}
          <button
            onClick={() => navigate('/patient-type')}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-700)] text-white text-xs font-medium rounded-md transition-colors"
          >
            <UserPlus size={14} />
            New Check-in
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-[var(--neutral-200)] rounded-lg px-5 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className="text-[var(--neutral-400)]" />
                {stat.trend && (
                  <span className="flex items-center gap-0.5 text-xs text-[var(--success-700)] font-medium">
                    <ArrowUpRight size={12} />
                    Up
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-[var(--neutral-900)] leading-none">{stat.value}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-1.5">{stat.label}</p>
              <p className="text-[10px] text-[var(--neutral-400)] mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-[var(--neutral-400)] uppercase tracking-wider mb-3">Quick Actions</p>
        <div className={`grid gap-3 ${quickActions.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group bg-white border border-[var(--neutral-200)] rounded-lg p-4 text-left hover:border-[var(--brand-300)] hover:bg-[var(--neutral-50)] transition-all"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-md bg-[var(--neutral-100)] flex items-center justify-center">
                    <Icon size={15} className="text-[var(--neutral-600)]" />
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-[var(--neutral-300)] group-hover:text-[var(--brand-500)] transition-colors"
                  />
                </div>
                <p className="text-sm font-medium text-[var(--neutral-900)]">{action.label}</p>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">{action.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
          <div className="px-5 py-4 border-b border-[var(--neutral-100)] flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--neutral-900)]">Recent Activity</p>
            <button
              onClick={() => navigate('/queue')}
              className="text-xs text-[var(--brand-500)] hover:underline"
            >
              View queue
            </button>
          </div>
          <div className="divide-y divide-[var(--neutral-100)]">
            {deriveActivity(tokens).length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-[var(--neutral-400)]">
                No activity yet today
              </div>
            ) : (
              deriveActivity(tokens).map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="mt-1.5 flex-shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${activityDotColor[a.type]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--neutral-800)] font-medium">{a.text}</p>
                    <p className="text-[10px] text-[var(--neutral-500)]">{a.name}</p>
                  </div>
                  <span className="text-[10px] text-[var(--neutral-400)] whitespace-nowrap">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Doctor Status */}
        <div className="bg-white border border-[var(--neutral-200)] rounded-lg">
          <div className="px-5 py-4 border-b border-[var(--neutral-100)] flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--neutral-900)]">Doctor Status</p>
          </div>
          <div className="divide-y divide-[var(--neutral-100)]">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      doctor.status === 'on-duty'
                        ? 'bg-[var(--success-500)]'
                        : doctor.status === 'break' || doctor.status === 'lunch'
                        ? 'bg-[var(--warning-500)]'
                        : 'bg-[var(--neutral-300)]'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-[var(--neutral-900)]">{doctor.name}</p>
                    <p className="text-xs text-[var(--neutral-500)]">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {doctor.status === 'on-duty' && (
                    <span className="text-xs text-[var(--neutral-400)]">
                      {doctor.queue} waiting
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    doctor.status === 'on-duty'
                      ? 'border-[var(--success-200)] text-[var(--success-700)] bg-[var(--success-50)]'
                      : doctor.status === 'break' || doctor.status === 'lunch'
                      ? 'border-[var(--warning-200)] text-[var(--warning-700)] bg-[var(--warning-50)]'
                      : 'border-[var(--neutral-200)] text-[var(--neutral-500)] bg-[var(--neutral-50)]'
                  }`}>
                    {doctor.status === 'on-duty' ? 'On Duty'
                      : doctor.status === 'break' ? 'On Break'
                      : doctor.status === 'lunch' ? 'Lunch'
                      : 'Off Duty'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
