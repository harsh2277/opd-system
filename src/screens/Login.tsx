import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

const DOCTOR_CREDENTIALS: Record<string, { id: string; password: string; label: string }> = {
  'sharma@gmail.com': { id: 'D001', password: 'sharma123', label: 'Doctor' },
};

export function Login() {
  const navigate = useNavigate();
  const { startSession, doctors } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = async (emailVal: string, passVal: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailVal, password: passVal }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const { token, user } = await response.json();
      clearDemoUsers();
      localStorage.setItem('opd-auth-token', token);

      if (user.role === 'Receptionist') {
        localStorage.setItem('current-reception-user', JSON.stringify(user));
        startSession();
        toast.success('Welcome back, Receptionist!');
        navigate('/dashboard');
      } else if (user.role === 'Doctor') {
        localStorage.setItem('current-doctor', JSON.stringify(user));
        toast.success(`Welcome, ${user.name}`);
        navigate('/doctor-dashboard');
      } else if (user.role === 'Pharmacy Staff') {
        localStorage.setItem('current-pharmacy-user', JSON.stringify({ ...user, loginAt: new Date().toISOString() }));
        toast.success('Welcome to Pharmacy Portal!');
        navigate('/pharmacy-dashboard');
      } else if (user.role === 'Chief Pathologist') {
        localStorage.setItem('current-lab-user', JSON.stringify({ ...user, loginAt: new Date().toISOString() }));
        toast.success('Welcome to Lab Portal!');
        navigate('/lab-dashboard');
      } else if (user.role === 'Administrator') {
        localStorage.setItem('current-admin-user', JSON.stringify(user));
        toast.success('Welcome to Admin Portal!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Unknown user role.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
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
                onClick={() => performLogin('harsh@gmail.com', 'harsh123')}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Receptionist
              </Button>
              <Button
                type="button"
                variant="line"
                size="sm"
                onClick={() => performLogin('pharmacy@gmail.com', 'pharmacy123')}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Pharmacy
              </Button>
              <Button
                type="button"
                variant="line"
                size="sm"
                onClick={() => performLogin('lab@gmail.com', 'lab123')}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Lab
              </Button>
              <Button
                type="button"
                variant="line"
                size="sm"
                onClick={() => performLogin('admin@gmail.com', 'admin123')}
                className="text-xs h-9 border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]"
              >
                Admin
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(DOCTOR_CREDENTIALS).map(([email, { password, label }]) => (
                <Button
                  key={email}
                  type="button"
                  variant="line"
                  size="sm"
                  onClick={() => performLogin(email, password)}
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
