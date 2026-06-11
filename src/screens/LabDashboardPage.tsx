import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, LogOut, User, RefreshCw, ChevronRight } from 'lucide-react';
import { LabDashboard } from './LabDashboard';
import { toast } from 'sonner';

interface LabUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function LabDashboardPage() {
  const navigate = useNavigate();
  const [labUser, setLabUser] = useState<LabUser | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem('current-lab-user');
    if (!stored) {
      navigate('/', { replace: true });
      return;
    }
    setLabUser(JSON.parse(stored));
  }, [navigate]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('current-lab-user');
    toast.success('Logged out successfully');
    setTimeout(() => navigate('/'), 500);
  };

  if (!labUser) return null;

  return (
    <div className="min-h-screen bg-[var(--neutral-50)] font-sans flex flex-col">
      <header className="sticky top-0 z-50 h-14 bg-white border-b border-[var(--neutral-200)] flex items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--brand-500)] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0d9488' }}>
            <FlaskConical size={15} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--neutral-800)] leading-none">OPD System</p>
            <p className="text-xs text-[var(--neutral-400)] mt-1">Lab Portal</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--neutral-500)]">
          <span>Pathology</span>
          <ChevronRight size={14} />
          <span className="text-[var(--neutral-900)] font-medium">Lab Reports</span>
        </div>

        <div className="text-right">
          <p className="text-sm font-mono font-semibold text-[var(--neutral-900)] tabular-nums">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[10px] text-[var(--neutral-400)]">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Right: user + actions */}
        <div className="flex items-center gap-2">
          {/* Refresh hint */}
          <button
            onClick={() => { toast.info('Lab data refreshed'); }}
            title="Refresh data"
            className="p-2 rounded-lg text-[var(--neutral-500)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)] transition-all"
          >
            <RefreshCw size={15} />
          </button>

          {/* User chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--neutral-50)] border border-[var(--neutral-200)]">
            <div className="w-6 h-6 rounded-full bg-[var(--brand-50)] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
              <User size={12} className="text-[var(--teal-600)]" style={{ color: '#0d9488' }} />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[var(--neutral-800)] leading-none">{labUser.name}</p>
              <p className="text-[10px] text-[var(--neutral-500)]">{labUser.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--neutral-500)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)] transition-all"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-screen-xl mx-auto w-full">
        {/* Session banner */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-6 text-xs bg-[var(--teal-50)] border border-[var(--teal-200)]">
          <div className="w-2 h-2 rounded-full bg-[var(--teal-500)] animate-pulse flex-shrink-0" />
          <span className="text-[var(--teal-700)] font-semibold">
            Active session: {labUser.name}
          </span>
          <span className="text-[var(--neutral-500)] ml-auto">
            Session started · {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* The actual lab dashboard content */}
        <LabDashboard />
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[10px] text-neutral-400 border-t border-neutral-200 bg-white">
        OPD Lab Portal · {labUser.name} · {labUser.role}
      </footer>
    </div>
  );
}
