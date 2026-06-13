import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Stethoscope, Users, Clock, Bell, User, LogOut, Activity,
  Coffee, UtensilsCrossed, CircleCheck, FlaskConical,
} from 'lucide-react';

interface DoctorLayoutProps {
  /** Shown in the top bar after "Doctor /". A string or rich node. */
  breadcrumb: ReactNode;
  /** Optional patient/context card rendered in the sidebar (used by the consultation screen). */
  contextPanel?: ReactNode;
  /** When true, the content area gets no padding (the screen supplies its own). */
  noPadding?: boolean;
  children: ReactNode;
}

function clsx(...c: (string | boolean | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function getDoctor() {
  const raw = localStorage.getItem('current-doctor');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; name: string; specialty: string; status?: string };
  } catch {
    localStorage.removeItem('current-doctor');
    return null;
  }
}

export function DoctorLayout({ breadcrumb, contextPanel, noPadding = false, children }: DoctorLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { tokens, updateDoctorStatus, notifications, clearNotifications, markNotificationsAsRead } = useApp();

  const [doctor, setDoctor] = useState(getDoctor);
  const [sessionTime, setSessionTime] = useState('0:00');
  const [pendingStatus, setPendingStatus] = useState<'break' | 'lunch' | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!doctor) navigate('/');
  }, [doctor, navigate]);

  useEffect(() => {
    const KEY = 'opd-doctor-session-start';
    if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, String(Date.now()));
    const start = parseInt(localStorage.getItem(KEY)!, 10);
    const id = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setSessionTime(`${h}:${String(m).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!doctor) return null;

  const mine = tokens.filter(t => t.doctor.id === doctor.id);
  const inConsult = mine.find(t => t.status === 'in-consultation');
  const labReady = mine.filter(t => t.labStatus === 'completed' && (t.status === 'waiting' || t.status === 'lab-pending'));
  const waitingCount = mine.filter(t => t.status === 'waiting' && !labReady.some(l => l.id === t.id)).length;
  const queueBadge = waitingCount + labReady.length;
  const unread = notifications.filter(n => n.unread).length;

  const onDashboard = location.pathname === '/doctor-dashboard';
  const view = searchParams.get('view') === 'history' ? 'history' : 'queue';
  const onConsultation = location.pathname.startsWith('/doctor-patient');

  const logout = () => {
    localStorage.removeItem('current-doctor');
    localStorage.removeItem('opd-doctor-session-start');
    navigate('/');
  };

  const setStatus = (status: 'on-duty' | 'break' | 'lunch') => {
    updateDoctorStatus(doctor.id, status);
    const next = { ...doctor, status };
    setDoctor(next);
    localStorage.setItem('current-doctor', JSON.stringify(next));
    setPendingStatus(null);
  };

  return (
    <div className="flex h-screen bg-[var(--neutral-50)] font-sans">
      {/* ══ Sidebar ══ */}
      <aside className="w-56 bg-white border-r border-[var(--neutral-200)] flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="h-14 flex items-center px-5 border-b border-[var(--neutral-200)] flex-shrink-0">
          <div className="w-7 h-7 bg-[var(--brand-500)] rounded-md flex items-center justify-center mr-2.5 flex-shrink-0">
            <Stethoscope size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--neutral-800)] leading-none">OPD System</p>
            <p className="text-xs text-[var(--neutral-400)] mt-1">Doctor Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          <div className="space-y-1">
            <p className="px-2 py-1 text-xs font-semibold text-[var(--neutral-400)] uppercase tracking-wider mb-1">Overview</p>
            <button
              onClick={() => navigate('/doctor-dashboard')}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm',
                onDashboard && view === 'queue'
                  ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-medium'
                  : 'text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)]'
              )}
            >
              <Users size={16} className={onDashboard && view === 'queue' ? 'text-[var(--brand-500)]' : 'text-[var(--neutral-400)]'} />
              <span className="flex-1 text-left">My Queue</span>
              {queueBadge > 0 && (
                <span className={clsx(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white',
                  labReady.length > 0 ? 'bg-[var(--teal-500)]' : 'bg-[var(--brand-500)]'
                )}>{queueBadge}</span>
              )}
            </button>
            <button
              onClick={() => navigate('/doctor-dashboard?view=history')}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm',
                onDashboard && view === 'history'
                  ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-medium'
                  : 'text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)]'
              )}
            >
              <Clock size={16} className={onDashboard && view === 'history' ? 'text-[var(--brand-500)]' : 'text-[var(--neutral-400)]'} />
              <span className="flex-1 text-left">Patient History</span>
            </button>
          </div>

          {inConsult && (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-semibold text-[var(--neutral-400)] uppercase tracking-wider mb-1">Active</p>
              <button
                onClick={() => navigate(`/doctor-patient/${inConsult.id}`)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors',
                  onConsultation
                    ? 'bg-[var(--brand-500)] text-white hover:bg-[var(--brand-600)]'
                    : 'bg-[var(--brand-50)] text-[var(--brand-700)] hover:bg-[var(--brand-100)]'
                )}
              >
                <Activity size={15} className={onConsultation ? 'text-white' : 'text-[var(--brand-500)]'} />
                <span className="flex-1 text-left">Current Patient</span>
                <span className={clsx('w-2 h-2 rounded-full animate-pulse flex-shrink-0', onConsultation ? 'bg-white/70' : 'bg-[var(--brand-500)]')} />
              </button>
            </div>
          )}

          {/* Optional context panel (e.g. patient card on consultation screen) */}
          {contextPanel && (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-semibold text-[var(--neutral-400)] uppercase tracking-wider mb-1">Current Patient</p>
              {contextPanel}
            </div>
          )}
        </nav>

        {/* My Status */}
        <div className="px-3 py-3 border-t border-[var(--neutral-100)] space-y-1.5 flex-shrink-0">
          <p className="px-1 text-[10px] font-bold text-[var(--neutral-400)] uppercase tracking-wider">My Status</p>
          {doctor.status && doctor.status !== 'on-duty' ? (
            <button
              onClick={() => setStatus('on-duty')}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold text-[var(--success-700)] bg-[var(--success-50)] border border-[var(--success-200)] hover:bg-[var(--success-100)]"
            >
              <CircleCheck size={12} /> Back on Duty
            </button>
          ) : pendingStatus ? (
            <div className="space-y-1.5">
              <p className="text-[10px] text-[var(--warning-700)] font-bold px-1">Confirm {pendingStatus}?</p>
              <div className="flex gap-1">
                <button onClick={() => setStatus(pendingStatus)}
                  className="flex-1 py-1.5 rounded-md text-xs font-bold text-white bg-[var(--warning-500)] hover:bg-[var(--warning-600)]">Yes</button>
                <button onClick={() => setPendingStatus(null)}
                  className="flex-1 py-1.5 rounded-md text-xs font-medium text-[var(--neutral-600)] bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)]">No</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-1">
              <button onClick={() => setPendingStatus('break')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium text-[var(--warning-700)] bg-[var(--warning-50)] border border-[var(--warning-200)] hover:bg-[var(--warning-100)]">
                <Coffee size={11} /> Break
              </button>
              <button onClick={() => setPendingStatus('lunch')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium text-[var(--warning-700)] bg-[var(--warning-50)] border border-[var(--warning-200)] hover:bg-[var(--warning-100)]">
                <UtensilsCrossed size={11} /> Lunch
              </button>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-[var(--neutral-200)] bg-[var(--neutral-50)] flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[var(--neutral-200)] flex items-center justify-center">
                <User size={14} className="text-[var(--neutral-600)]" />
              </div>
              <span className={clsx(
                'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                (!doctor.status || doctor.status === 'on-duty') ? 'bg-[var(--success-500)]' : 'bg-[var(--warning-400)]'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--neutral-700)] font-medium truncate">{doctor.name}</p>
              <p className="text-[10px] text-[var(--neutral-400)] truncate">{doctor.specialty}</p>
            </div>
            <button onClick={logout} className="text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ Main column ══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[var(--neutral-200)] shadow-sm flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[var(--neutral-500)] min-w-0">
            <span>Doctor</span>
            <span className="text-[var(--neutral-300)]">/</span>
            <span className="text-[var(--neutral-900)] font-medium truncate flex items-center gap-2">{breadcrumb}</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-mono text-[var(--neutral-500)] bg-[var(--neutral-50)] border border-[var(--neutral-200)] px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Clock size={11} /> {sessionTime}
            </span>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(v => !v); if (!showNotifications) markNotificationsAsRead(); }}
                className="relative p-2 hover:bg-[var(--neutral-100)] rounded-md transition-colors text-[var(--neutral-600)] cursor-pointer flex items-center justify-center"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--error-500)] rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--neutral-200)] rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[var(--neutral-100)] bg-[var(--neutral-50)] flex justify-between items-center">
                    <span className="text-xs font-semibold text-[var(--neutral-800)]">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => { clearNotifications(); setShowNotifications(false); }}
                        className="text-[10px] font-semibold text-[var(--brand-500)] hover:text-[var(--brand-700)] hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-[var(--neutral-100)] max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-[var(--neutral-50)] transition-colors flex gap-2">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className={clsx(
                              'w-1.5 h-1.5 rounded-full',
                              n.type === 'success' ? 'bg-[var(--success-500)]' : n.type === 'warning' ? 'bg-[var(--warning-500)]' : 'bg-[var(--brand-500)]'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs text-[var(--neutral-700)] leading-normal">{n.text}</p>
                            <span className="text-[9px] text-[var(--neutral-400)] mt-1 block">{n.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[var(--neutral-400)]">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-[var(--neutral-100)] border border-[var(--neutral-200)] flex items-center justify-center">
              <User size={15} className="text-[var(--neutral-600)]" />
            </div>
          </div>
        </header>

        {/* Page content */}
        {noPadding ? (
          /* Screen manages its own scroll body + footer (e.g. consultation) */
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>
        ) : (
          <main className="flex-1 overflow-auto">
            <div key={location.pathname + view} className="p-6 animate-fade-in">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
