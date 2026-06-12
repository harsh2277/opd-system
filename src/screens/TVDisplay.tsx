import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Clock, Users, Stethoscope, Bell, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Patient {
  name: string;
  age: string;
  gender: string;
  mobile: string;
  bloodGroup: string;
  selectedConditions: string[];
  address?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  queue: number;
  avgWait: number;
  status: 'on-duty' | 'off-duty' | 'break' | 'lunch';
}

interface Token {
  id?: string;
  token: string;
  patient: Patient;
  doctor: Doctor;
  issuedAt: string;
  status: 'waiting' | 'in-consultation' | 'done' | 'skipped';
  urgent: boolean;
}

export function TVDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tokens, setTokens] = useState<Token[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Load data from localStorage and poll every second
  useEffect(() => {
    const loadData = () => {
      try {
        const tokensData = localStorage.getItem('opd-tokens');
        const doctorsData = localStorage.getItem('opd-doctors');
        const currentTokenData = localStorage.getItem('opd-current-token');

        if (tokensData) {
          setTokens(JSON.parse(tokensData));
        }
        if (doctorsData) {
          setDoctors(JSON.parse(doctorsData));
        }
        if (currentTokenData) {
          setCurrentToken(currentTokenData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample data if nothing loaded
  const sampleTokens: Token[] = tokens.length === 0 ? [
    {
      id: 'sample-1',
      token: 'OPD-101',
      patient: { name: 'Rajesh Kumar', age: '45', gender: 'Male', mobile: '9876543210', bloodGroup: 'O+', selectedConditions: [] },
      doctor: { id: 'D001', name: 'Dr. Sharma', specialty: 'General Physician', queue: 3, avgWait: 15, status: 'on-duty' },
      issuedAt: new Date().toISOString(),
      status: 'waiting',
      urgent: false,
    },
    {
      id: 'sample-2',
      token: 'OPD-102',
      patient: { name: 'Priya Patel', age: '32', gender: 'Female', mobile: '9876543211', bloodGroup: 'A+', selectedConditions: [] },
      doctor: { id: 'D002', name: 'Dr. Patel', specialty: 'Cardiologist', queue: 2, avgWait: 12, status: 'on-duty' },
      issuedAt: new Date().toISOString(),
      status: 'waiting',
      urgent: false,
    },
    {
      id: 'sample-3',
      token: 'OPD-103',
      patient: { name: 'Amit Singh', age: '28', gender: 'Male', mobile: '9876543212', bloodGroup: 'B+', selectedConditions: ['Asthma'] },
      doctor: { id: 'D003', name: 'Dr. Kumar', specialty: 'Pediatrician', queue: 1, avgWait: 8, status: 'on-duty' },
      issuedAt: new Date().toISOString(),
      status: 'in-consultation',
      urgent: true,
    },
  ] : tokens;

  const sampleDoctors: Doctor[] = doctors.length === 0 ? [
    { id: 'D001', name: 'Dr. Sharma', specialty: 'General Physician', queue: 3, avgWait: 15, status: 'on-duty' },
    { id: 'D002', name: 'Dr. Patel', specialty: 'Cardiologist', queue: 2, avgWait: 12, status: 'on-duty' },
    { id: 'D003', name: 'Dr. Kumar', specialty: 'Pediatrician', queue: 1, avgWait: 8, status: 'on-duty' },
    { id: 'D004', name: 'Dr. Singh', specialty: 'Dermatologist', queue: 2, avgWait: 10, status: 'break' },
  ] : doctors;

  const displayTokens = sampleTokens;
  const displayDoctors = sampleDoctors;

  const waitingTokens = displayTokens.filter((t) => t.status === 'waiting').slice(0, 8);
  const currentTokenData = displayTokens.find((t) => t.token === currentToken) || displayTokens.find((t) => t.status === 'in-consultation');

  return (
    <div className="h-screen bg-[var(--neutral-100)] flex flex-col overflow-hidden font-sans">
      {/* Simple Header */}
      <div className="bg-white border-b border-[var(--neutral-200)] px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--brand-500)] flex items-center justify-center flex-shrink-0">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--neutral-900)]">OPD Queue Display</h1>
              {tokens.length === 0 && <p className="text-[10px] text-[var(--neutral-500)]">(Demo Mode)</p>}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] uppercase font-semibold text-[var(--neutral-400)] mb-0.5">Total Waiting</p>
              <p className="text-xl font-bold text-[var(--brand-700)]">{waitingTokens.length}</p>
            </div>
            <div className="w-px h-8 bg-[var(--neutral-200)]"></div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-[var(--neutral-800)] tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[10px] text-[var(--neutral-400)] mt-0.5">
                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid split: Left (Queue/Now Serving), Right (Doctor Statuses) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column (Main Token Area) */}
        <div className="flex-1 flex flex-col border-r border-[var(--neutral-200)] overflow-hidden">
          {/* Current Token Display */}
          <div className="bg-white p-8 border-b border-[var(--neutral-200)] flex-shrink-0">
            {currentTokenData ? (
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-[var(--brand-600)] font-bold mb-4">Now Serving</p>
                <div className="bg-[var(--brand-50)] rounded-xl px-16 py-6 inline-block border border-[var(--brand-200)]">
                  <p className="font-mono text-[90px] font-bold text-[var(--brand-700)] tabular-nums leading-none">
                    {currentTokenData.token}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-12 mt-6">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--neutral-400)] mb-1">Patient</p>
                    <p className="text-base font-bold text-[var(--neutral-800)]">{currentTokenData.patient.name}</p>
                  </div>
                  <div className="h-8 w-px bg-[var(--neutral-200)]"></div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--neutral-400)] mb-1">Doctor Assigned</p>
                    <p className="text-base font-bold text-[var(--neutral-800)]">{currentTokenData.doctor.name}</p>
                    <p className="text-xs text-[var(--neutral-500)]">{currentTokenData.doctor.specialty}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock size={40} className="mx-auto mb-3 text-[var(--neutral-300)]" />
                <p className="text-sm font-semibold text-[var(--neutral-600)]">All Patients Cleared</p>
                <p className="text-xs text-[var(--neutral-400)] mt-0.5">Waiting for next check-in...</p>
              </div>
            )}
          </div>

          {/* Waiting Queue Cards */}
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <h2 className="text-sm font-bold text-[var(--neutral-700)] mb-4 uppercase tracking-wide">Next in Line</h2>
            {waitingTokens.length > 0 ? (
              <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-1">
                {waitingTokens.map((token, index) => (
                  <div
                    key={token.id || `${token.token}-${index}`}
                    className={`relative p-5 rounded-lg border flex flex-col items-center justify-center min-h-[160px] bg-white ${
                      token.urgent
                        ? 'border-[var(--error-400)] bg-[var(--error-50)]'
                        : 'border-[var(--neutral-200)]'
                    }`}
                  >
                    <div className="absolute top-2.5 left-2.5">
                      <span className="w-5 h-5 rounded bg-[var(--brand-50)] text-[var(--brand-700)] text-[10px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>

                    {token.urgent && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[var(--error-100)] text-[var(--error-600)] border border-[var(--error-200)] rounded">
                          URGENT
                        </span>
                      </div>
                    )}

                    <p className="font-mono text-3xl font-bold text-[var(--neutral-900)] mb-2 mt-2">
                      {token.token}
                    </p>
                    <div className="w-full text-center border-t border-[var(--neutral-100)] pt-2 mt-2 space-y-1">
                      <p className="text-xs font-semibold text-[var(--neutral-700)] truncate">
                        {token.doctor.name}
                      </p>
                      <p className="text-[10px] text-[var(--brand-600)] font-semibold">
                        ~{(index + 1) * (token.doctor.avgWait || 15)} min wait
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Users size={32} className="text-[var(--neutral-300)] mb-2" />
                <p className="text-xs text-[var(--neutral-500)]">No pending queue</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Doctor Statuses list) */}
        <div className="w-80 bg-white flex flex-col overflow-hidden p-6">
          <h2 className="text-sm font-bold text-[var(--neutral-700)] mb-4 uppercase tracking-wide flex items-center gap-1.5">
            <Activity size={14} className="text-[var(--brand-500)]" />
            Duty Roster & Status
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {displayDoctors.map((doc) => {
              let statusLabel = 'Off Duty';
              let statusClass = 'border-[var(--neutral-200)] text-[var(--neutral-500)] bg-[var(--neutral-50)]';
              
              if (doc.status === 'on-duty') {
                statusLabel = 'Active';
                statusClass = 'border-[var(--success-200)] text-[var(--success-700)] bg-[var(--success-50)]';
              } else if (doc.status === 'break') {
                statusLabel = 'On Break';
                statusClass = 'border-yellow-200 text-yellow-700 bg-yellow-50';
              } else if (doc.status === 'lunch') {
                statusLabel = 'Lunch Break';
                statusClass = 'border-red-200 text-red-700 bg-red-50';
              }

              return (
                <div key={doc.id} className="p-3 border border-[var(--neutral-200)] rounded-lg flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--neutral-800)] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[var(--neutral-500)] truncate">{doc.specialty}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded ${statusClass}`}>
                      {statusLabel}
                    </span>
                    {doc.status === 'on-duty' && (
                      <span className="text-[9px] text-[var(--neutral-400)]">
                        {doc.queue} waiting
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="border-t border-[var(--neutral-200)] px-8 py-3 bg-[var(--neutral-50)] flex-shrink-0">
        <div className="flex items-center justify-center gap-6 text-[10px] text-[var(--neutral-400)]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Sync Active</span>
          </div>
          <span className="text-[var(--neutral-300)]">•</span>
          <span>{tokens.length} Total Registered Today</span>
        </div>
      </div>
    </div>
  );
}
