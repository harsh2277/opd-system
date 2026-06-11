import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
  { icon: CreditCard, label: 'Billing', path: '/admin/billing' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const adminUser = getAdminUser();
  const currentPage = location.pathname === '/admin/users/add'
    ? { label: 'Add User' }
    : adminNav.find((item) => location.pathname.startsWith(item.path));

  return (
    <div className="flex h-screen bg-[var(--neutral-50)] font-sans">
      <aside className="w-60 bg-white border-r border-[var(--neutral-200)] flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-[var(--neutral-200)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--brand-900)] rounded-md flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--neutral-900)] leading-none">OPD System</p>
              <p className="text-xs text-[var(--neutral-400)] mt-1">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm',
                  active
                    ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-medium'
                    : 'text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)]'
                )}
              >
                <Icon size={16} className={active ? 'text-[var(--brand-500)]' : 'text-[var(--neutral-400)]'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-[var(--neutral-200)] bg-[var(--neutral-50)]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--brand-100)] flex items-center justify-center">
              <ShieldCheck size={14} className="text-[var(--brand-700)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--neutral-700)] font-medium truncate">{adminUser.name}</p>
              <p className="text-[10px] text-[var(--neutral-400)] truncate">{adminUser.email}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('current-admin-user');
                navigate('/');
              }}
              className="text-[var(--neutral-400)] hover:text-[var(--neutral-600)] transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[var(--neutral-200)] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[var(--neutral-500)]">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-[var(--neutral-900)] font-medium">{currentPage?.label ?? 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-[var(--neutral-100)] rounded-md transition-colors text-[var(--neutral-600)]">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--error-500)] rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getAdminUser() {
  const stored = localStorage.getItem('current-admin-user');

  if (stored) {
    try {
      return JSON.parse(stored) as {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    } catch {
      localStorage.removeItem('current-admin-user');
    }
  }

  return {
    id: 'ADM001',
    name: 'Admin User',
    email: 'admin@gmail.com',
    role: 'Administrator',
  };
}
