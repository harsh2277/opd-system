import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  UserPlus,
  ListChecks,
  Bell,
  User,
  Users,
  Stethoscope,
  LogOut,
  ChevronRight,
  Receipt,
} from 'lucide-react';

interface DesktopLayoutProps {
  children: ReactNode;
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ],
  },
  {
    label: 'Patient Flow',
    items: [
      { icon: UserPlus, label: 'Check-in', path: '/patient-type' },
      { icon: ListChecks, label: 'Queue', path: '/queue' },
      { icon: Users, label: 'Patient Records', path: '/patients' },
      { icon: Receipt, label: 'Billing', path: '/billing' },
    ],
  },
];

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, clearNotifications, markNotificationsAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const portalUser = getPortalUser();
  const portalLabel = 'Reception Portal';
  const visibleNavGroups = navGroups;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n') navigate('/patient-type');
      else if (e.key === 'q') navigate('/queue');
      else if (e.key === 'b') navigate('/billing');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleNavClick = (e: React.MouseEvent, path: string, external?: boolean) => {
    if (external) {
      e.preventDefault();
      window.open(path, '_blank', 'width=1920,height=1080,fullscreen=yes');
    }
  };

  const getPageTitle = () => {
    const allItems = visibleNavGroups.flatMap((g) => g.items);
    const matched = allItems.find((item) => location.pathname.startsWith(item.path) && !item.external);
    return matched?.label ?? 'OPD Management';
  };

  return (
    <div className="flex h-screen bg-[var(--neutral-50)] font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-[var(--neutral-200)] flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="h-14 flex items-center px-5 border-b border-[var(--neutral-200)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--brand-500)] rounded flex items-center justify-center flex-shrink-0">
              <Stethoscope size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--neutral-800)] leading-none">OPD System</p>
              <p className="text-xs text-[var(--neutral-400)] mt-1">{portalLabel}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {visibleNavGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-2 py-1 text-xs font-semibold text-[var(--neutral-400)] uppercase tracking-wider mb-1">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  !item.external &&
                  (item.path === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.path));
                return item.external ? (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => handleNavClick(e, item.path, true)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)] transition-colors cursor-pointer"
                  >
                    <Icon size={16} className="text-[var(--neutral-400)]" />
                    <span className="text-sm">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm',
                      isActive
                        ? 'bg-[var(--brand-50)] text-[var(--brand-700)] font-medium'
                        : 'text-[var(--neutral-600)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)]'
                    )}
                  >
                    <Icon size={16} className={isActive ? 'text-[var(--brand-500)]' : 'text-[var(--neutral-400)]'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-[var(--neutral-200)] bg-[var(--neutral-50)]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--neutral-200)] flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[var(--neutral-600)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--neutral-700)] font-medium truncate">{portalUser.name}</p>
              <p className="text-[10px] text-[var(--neutral-400)] truncate">{portalUser.email}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('current-reception-user');
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-[var(--neutral-200)] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[var(--neutral-500)]">
            <span>Reception</span>
            <ChevronRight size={14} />
            <span className="text-[var(--neutral-900)] font-medium">{getPageTitle()}</span>
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600 cursor-pointer flex items-center justify-center"
              >
                <Bell size={18} />
                {notifications.some((n) => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error-500 rounded-full animate-bounce"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                    <span className="text-xs font-semibold text-neutral-800">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          clearNotifications();
                          setShowNotifications(false);
                        }}
                        className="text-[10px] font-semibold text-brand-500 hover:text-brand-700 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-neutral-50/50 transition-colors flex gap-2">
                          <div className="mt-0.5 flex-shrink-0">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                n.type === 'success'
                                  ? 'bg-success-500'
                                  : n.type === 'warning'
                                  ? 'bg-warning-500'
                                  : 'bg-brand-500'
                              }`}
                            ></div>
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs text-neutral-700 leading-normal">{n.text}</p>
                            <span className="text-[9px] text-neutral-400 mt-1 block">{n.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-neutral-400">
                        No notifications
                      </div>
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>

        {/* Keyboard shortcut hint bar */}
        <div className="h-7 bg-[var(--neutral-50)] border-t border-[var(--neutral-200)] flex items-center px-6 gap-4 flex-shrink-0">
          {[
            { key: 'N', label: 'New check-in' },
            { key: 'Q', label: 'Queue' },
            { key: 'B', label: 'Billing' },
          ].map(({ key, label }) => (
            <span key={key} className="flex items-center gap-1.5 text-[10px] text-[var(--neutral-400)]">
              <kbd className="px-1.5 py-0.5 text-[9px] font-semibold bg-white border border-[var(--neutral-300)] rounded shadow-sm text-[var(--neutral-600)]">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getPortalUser() {
  const storedReception = localStorage.getItem('current-reception-user');

  if (storedReception) {
    try {
      return JSON.parse(storedReception) as {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    } catch {
      localStorage.removeItem('current-reception-user');
    }
  }

  return {
    id: 'RC001',
    name: 'Harsh Reception',
    email: 'harsh@gmail.com',
    role: 'Receptionist',
  };
}
