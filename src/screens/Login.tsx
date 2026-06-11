import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

const DOCTOR_CREDENTIALS: Record<string, { id: string; password: string; label: string }> = {
  'sharma@gmail.com':  { id: 'D001', password: 'sharma123',  label: 'Dr. Sharma'  },
  'patel@gmail.com':   { id: 'D002', password: 'patel123',   label: 'Dr. Patel'   },
  'kumar@gmail.com':   { id: 'D003', password: 'kumar123',   label: 'Dr. Kumar'   },
  'singh@gmail.com':   { id: 'D004', password: 'singh123',   label: 'Dr. Singh'   },
  'mehta@gmail.com':   { id: 'D005', password: 'mehta123',   label: 'Dr. Mehta'   },
  'rao@gmail.com':     { id: 'D006', password: 'rao123',     label: 'Dr. Rao'     },
};

export function Login() {
  const navigate = useNavigate();
  const { startSession, doctors } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Receptionist
    if (trimmedEmail === 'harsh@gmail.com' && password === 'harsh123') {
      const receptionUser = {
        id: 'RC001',
        name: 'Harsh Reception',
        email: 'harsh@gmail.com',
        role: 'Receptionist',
      };
      clearDemoUsers();
      localStorage.setItem('current-reception-user', JSON.stringify(receptionUser));
      startSession();
      toast.success('Welcome back, Receptionist!');
      navigate('/dashboard');
    }
    // 2. Doctors — individual credentials per doctor
    else if (DOCTOR_CREDENTIALS[trimmedEmail] && password === DOCTOR_CREDENTIALS[trimmedEmail].password) {
      const doctorId = DOCTOR_CREDENTIALS[trimmedEmail].id;
      const matchedDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];
      clearDemoUsers();
      localStorage.setItem('current-doctor', JSON.stringify(matchedDoctor));
      toast.success(`Welcome, ${matchedDoctor.name}`);
      navigate('/doctor-dashboard');
    }
    // 3. Pharmacy
    else if (trimmedEmail === 'pharmacy@gmail.com' && password === 'pharmacy123') {
      const mockUser = { id: 'PH003', name: 'Pharmacy Staff', email: 'pharmacy@gmail.com', role: 'Pharmacy Staff' };
      clearDemoUsers();
      localStorage.setItem('current-pharmacy-user', JSON.stringify(mockUser));
      toast.success('Welcome to Pharmacy Portal!');
      navigate('/pharmacy-dashboard');
    }
    // 4. Lab
    else if (trimmedEmail === 'lab@gmail.com' && password === 'lab123') {
      const mockUser = { id: 'LB001', name: 'Lab Staff', email: 'lab@gmail.com', role: 'Chief Pathologist' };
      clearDemoUsers();
      localStorage.setItem('current-lab-user', JSON.stringify(mockUser));
      toast.success('Welcome to Lab Portal!');
      navigate('/lab-dashboard');
    }
    // 5. Admin
    else if (trimmedEmail === 'admin@gmail.com' && password === 'admin123') {
      const adminUser = { id: 'ADM001', name: 'Prem Admin', email: 'admin@gmail.com', role: 'Administrator' };
      clearDemoUsers();
      localStorage.setItem('current-admin-user', JSON.stringify(adminUser));
      toast.success('Welcome to Admin Portal!');
      navigate('/admin/dashboard');
    }
    // Invalid
    else {
      toast.error('Invalid email or password. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--neutral-100)] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[var(--neutral-200)] rounded-xl p-8 shadow-sm space-y-6">
        {/* Logo and Headings */}
        <div className="text-center">
          <div className="w-12 h-12 bg-[var(--brand-500)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg font-bold">OPD</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--neutral-900)] mb-1">OPD Management System</h1>
          <p className="text-sm text-[var(--neutral-500)]">Sign in to access your portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input */}
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Input */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-[var(--neutral-400)] hover:text-[var(--neutral-600)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" size="lg" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-[var(--neutral-200)]"></div>
            <span className="absolute bg-white px-3 text-[10px] text-[var(--neutral-400)] font-semibold uppercase tracking-wider">
              Quick Fill Demo Login
            </span>
          </div>

          <div className="space-y-2">
            {/* Staff portals */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="line"
                size="sm"
                onClick={() => { setEmail('harsh@gmail.com'); setPassword('harsh123'); }}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Receptionist
              </Button>
              <Button
                type="button"
                variant="line"
                size="sm"
                onClick={() => { setEmail('pharmacy@gmail.com'); setPassword('pharmacy123'); }}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Pharmacy
              </Button>
              <Button
                type="button"
                variant="line"
                size="sm"
                onClick={() => { setEmail('lab@gmail.com'); setPassword('lab123'); }}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Lab
              </Button>
              <Button
                type="button"
                variant="line"
                size="sm"
                onClick={() => { setEmail('admin@gmail.com'); setPassword('admin123'); }}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Admin
              </Button>
            </div>
            {/* Individual doctor logins */}
            <p className="text-[10px] text-[var(--neutral-400)] text-center pt-1">Doctors</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DOCTOR_CREDENTIALS).map(([email, { password, label }]) => (
                <Button
                  key={email}
                  type="button"
                  variant="line"
                  size="sm"
                  onClick={() => { setEmail(email); setPassword(password); }}
                  className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-center text-[var(--neutral-400)] mt-4">
            Protected by OPD Security Protocol
          </p>
        </form>
      </div>
    </div>
  );
}

function clearDemoUsers() {
  localStorage.removeItem('current-reception-user');
  localStorage.removeItem('current-doctor');
  localStorage.removeItem('current-pharmacy-user');
  localStorage.removeItem('current-lab-user');
  localStorage.removeItem('current-admin-user');
}
