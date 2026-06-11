import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TestDataButton } from '../components/TestDataButton';
import { ClearDataButton } from '../components/ClearDataButton';
import { Users, Clock, Stethoscope, TrendingUp, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { tokens, doctors, addToken } = useApp();

  // Add sample tokens on first load for testing
  useEffect(() => {
    const hasInitialized = localStorage.getItem('opd-initialized');

    if (!hasInitialized && tokens.length === 0 && doctors.length > 0) {
      console.log('Adding sample tokens...');

      // Generate unique token numbers using timestamp
      const baseTime = Date.now();

      // Add 3 sample tokens automatically
      const sampleTokens = [
        {
          id: `token-${baseTime}-1`,
          token: `OPD-${(baseTime).toString().slice(-3)}`,
          patient: { name: 'Rajesh Kumar', age: '45', gender: 'Male', mobile: '9876543210', bloodGroup: 'O+', selectedConditions: [] },
          doctor: doctors[0],
          issuedAt: new Date().toISOString(),
          status: 'waiting' as const,
          urgent: false,
        },
        {
          id: `token-${baseTime}-2`,
          token: `OPD-${(baseTime + 1).toString().slice(-3)}`,
          patient: { name: 'Priya Patel', age: '32', gender: 'Female', mobile: '9876543211', bloodGroup: 'A+', selectedConditions: [] },
          doctor: doctors[1],
          issuedAt: new Date().toISOString(),
          status: 'waiting' as const,
          urgent: false,
        },
        {
          id: `token-${baseTime}-3`,
          token: `OPD-${(baseTime + 2).toString().slice(-3)}`,
          patient: { name: 'Amit Singh', age: '28', gender: 'Male', mobile: '9876543212', bloodGroup: 'B+', selectedConditions: ['Asthma'] },
          doctor: doctors[2],
          issuedAt: new Date().toISOString(),
          status: 'in-consultation' as const,
          urgent: false,
        },
      ];

      setTimeout(() => {
        sampleTokens.forEach(token => {
          console.log('Adding token:', token.token);
          addToken(token);
        });
        localStorage.setItem('opd-initialized', 'true');
      }, 100);
    }
  }, [doctors, addToken]);

  const waitingCount = tokens.filter((t) => t.status === 'waiting').length;
  const onDutyCount = doctors.filter((d) => d.status === 'on-duty').length;
  const avgWait = onDutyCount > 0
    ? Math.round(doctors.filter((d) => d.status === 'on-duty').reduce((acc, d) => acc + d.avgWait, 0) / onDutyCount)
    : 0;

  const stats = [
    { label: 'Tokens Issued Today', value: tokens.length.toString(), icon: Users, color: 'teal', trend: `${tokens.length} total` },
    { label: 'Currently Waiting', value: waitingCount.toString(), icon: Clock, color: 'warning', trend: 'In queue' },
    { label: 'Doctors on Duty', value: onDutyCount.toString(), icon: Stethoscope, color: 'success', trend: 'Available now' },
    { label: 'Avg Wait Time', value: `${avgWait} min`, icon: Clock, color: 'neutral', trend: 'Current average' },
  ];

  const recentTokens = tokens.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Debug Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-900">
            📺 TV Display Testing: {tokens.length} tokens in queue
          </p>
          <p className="text-xs text-blue-600">
            Open <a href="/display-debug" target="_blank" className="underline font-bold">Debug Page</a> to see what's in localStorage
          </p>
        </div>
        <div className="flex gap-2">
          <TestDataButton />
          <ClearDataButton />
          <Button size="sm" onClick={() => window.open('/display', '_blank', 'width=1920,height=1080')}>
            Open TV Display
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-[var(--neutral-500)] mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold font-heading text-[var(--neutral-900)]">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--teal-50)] flex items-center justify-center">
                  <Icon size={24} className="text-[var(--teal-500)]" />
                </div>
              </div>
              <p className="text-xs text-[var(--neutral-400)]">{stat.trend}</p>
            </Card>
          );
        })}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Primary Action Card */}
        <Card className="p-8 bg-[var(--teal-50)] border-[var(--teal-200)]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--teal-500)] flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-white" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-[var(--neutral-900)] mb-2">
              Start Patient Check-in
            </h3>
            <p className="text-[var(--neutral-600)] mb-6">Register new or find returning patient</p>
            <Button
              size="lg"
              className="w-full bg-[var(--teal-500)] hover:bg-[var(--teal-700)]"
              onClick={() => navigate('/patient-type')}
            >
              Begin Check-in
            </Button>
          </div>
        </Card>

        {/* Doctor Status */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-lg font-semibold">Doctors on Duty Today</h3>
            <a href="#" className="text-sm text-[var(--brand-500)] hover:underline">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <div key={doctor.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-100)] flex items-center justify-center">
                    <Stethoscope size={20} className="text-[var(--brand-500)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--neutral-900)]">{doctor.name}</p>
                    <p className="text-sm text-[var(--neutral-500)]">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--neutral-600)] font-mono">{doctor.queue} waiting</span>
                  <Badge variant={doctor.status as 'on-duty' | 'off-duty'}>
                    {doctor.status === 'on-duty' ? 'ON DUTY' : 'OFF DUTY'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Tokens Table */}
      <Card className="p-6">
        <h3 className="font-heading text-lg font-semibold mb-4">Recent Tokens</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--neutral-200)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--neutral-600)]">Token #</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--neutral-600)]">Patient Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--neutral-600)]">Doctor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--neutral-600)]">Issued At</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--neutral-600)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTokens.length > 0 ? (
                recentTokens.map((token) => (
                  <tr key={token.id || token.token} className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)]">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--neutral-900)]">{token.token}</td>
                    <td className="py-3 px-4 text-[var(--neutral-700)]">{token.patient.name}</td>
                    <td className="py-3 px-4 text-[var(--neutral-700)]">{token.doctor.name}</td>
                    <td className="py-3 px-4 text-[var(--neutral-600)]">
                      {new Date(token.issuedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={token.status === 'in-consultation' ? 'active' : token.status}>
                        {token.status === 'in-consultation' ? 'IN CONSULTATION' : token.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--neutral-500)]">
                    No tokens issued yet today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
