import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Stethoscope, Users, Clock, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { generateTokenNumber } from '../utils/tokenCounter';

export function DoctorSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, isNew } = location.state || {};
  const { doctors } = useApp();
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');
  const [showOffDuty, setShowOffDuty] = useState(false);

  // Guard: if we arrive here without patient data, send back to start
  useEffect(() => {
    if (!patient) {
      toast.error('Patient details missing. Please start again.');
      navigate('/patient-type');
    }
  }, [patient, navigate]);

  if (!patient) return null;

  const handleIssueToken = () => {
    if (selectedDoctor) {
      const uniqueToken = generateTokenNumber();

      navigate('/token-receipt', {
        state: {
          patient,
          doctor: selectedDoctor,
          isNew,
          token: uniqueToken,
        },
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-2 mb-4">
          {[
            { label: 'Patient Type', num: 1, state: 'done' as const, onClick: () => navigate('/patient-type') },
            { label: 'Details', num: 2, state: 'done' as const, onClick: () => navigate(-1) },
            { label: 'Doctor', num: 3, state: 'active' as const, onClick: undefined },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && <div className="w-10 h-px bg-[var(--brand-200)]" />}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={step.onClick}
                  disabled={!step.onClick}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    step.state === 'done' ? 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white cursor-pointer hover:bg-[var(--brand-700)]' :
                    step.state === 'active' ? 'bg-white border-[var(--brand-500)] text-[var(--brand-700)] cursor-default' :
                    'bg-white border-[var(--neutral-300)] text-[var(--neutral-400)] cursor-default'
                  }`}
                >
                  {step.state === 'done' ? <Check size={14} /> : step.num}
                </button>
                <span className={`text-[10px] font-medium whitespace-nowrap ${step.state !== 'upcoming' ? 'text-[var(--brand-600)]' : 'text-[var(--neutral-400)]'}`}>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-lg text-[var(--neutral-700)]">
          <span className="font-semibold">Step 3 of 3</span> — Select Doctor
        </p>
      </div>

      {/* Patient Banner */}
      <Card className="p-4 mb-6 bg-[var(--brand-50)] border-[var(--brand-200)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-500)] text-white flex items-center justify-center font-bold">
              {patient?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <p className="font-semibold text-[var(--neutral-900)]">Checking in: {patient?.name || 'Patient'}</p>
              <p className="text-sm text-[var(--neutral-600)]">
                {patient?.age} years • {patient?.gender || 'N/A'}
              </p>
            </div>
          </div>
          <Badge variant={isNew ? 'new' : 'returning'}>{isNew ? 'NEW PATIENT' : 'RETURNING'}</Badge>
        </div>
      </Card>

      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--neutral-900)] mb-2">Select a Doctor</h2>
          <p className="text-[var(--neutral-600)]">Choose from available doctors on duty today</p>
        </div>
        {/* Specialty filter chips */}
        <div className="flex flex-wrap gap-2">
          {['All', ...Array.from(new Set(doctors.map((d) => d.specialty)))].map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialtyFilter(spec)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                specialtyFilter === spec
                  ? 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white'
                  : 'bg-white border-[var(--neutral-200)] text-[var(--neutral-600)] hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Grid — on-duty only */}
      {(() => {
        const filtered = doctors.filter((d) => specialtyFilter === 'All' || d.specialty === specialtyFilter);
        const onDuty = filtered.filter(d => d.status !== 'off-duty');
        const offDuty = filtered.filter(d => d.status === 'off-duty');

        const DoctorCard = ({ doctor }: { doctor: typeof doctors[0] }) => {
          const isSelected = selectedDoctor?.id === doctor.id;
          const isOffDuty = doctor.status === 'off-duty';
          return (
            <Card
              key={doctor.id}
              hover={!isOffDuty}
              className={`p-6 transition-all cursor-pointer ${
                isOffDuty ? 'opacity-50 cursor-not-allowed' : ''
              } ${isSelected ? 'border-[var(--brand-500)] border bg-[var(--brand-50)]' : ''}`}
              onClick={() => !isOffDuty && setSelectedDoctor(doctor)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--brand-100)] flex items-center justify-center">
                  <Stethoscope size={20} className="text-[var(--brand-500)]" />
                </div>
                <div className="flex gap-2">
                  <Badge variant={doctor.status as 'on-duty' | 'off-duty'}>
                    {doctor.status === 'on-duty' ? 'ON DUTY' : doctor.status === 'break' ? 'ON BREAK' : doctor.status === 'lunch' ? 'LUNCH' : 'OFF DUTY'}
                  </Badge>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[var(--brand-500)] flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
              <h3 className="font-heading text-lg font-bold text-[var(--neutral-900)] mb-1">{doctor.name}</h3>
              <p className="text-sm text-[var(--neutral-600)]">{doctor.specialty}</p>
              {isOffDuty && <p className="text-xs text-[var(--neutral-400)] mt-0.5 mb-4">Not available today</p>}
              {!isOffDuty && <div className="mb-4" />}
              <div className="pt-4 border-t border-[var(--neutral-200)] space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-[var(--neutral-500)]" />
                  <span className="text-[var(--neutral-700)]">
                    <span className="font-bold">{doctor.queue}</span> patients waiting
                  </span>
                </div>
                {doctor.status === 'on-duty' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-[var(--neutral-500)]" />
                    <span className="text-[var(--neutral-600)]">Avg ~{doctor.avgWait} min wait</span>
                  </div>
                )}
              </div>
            </Card>
          );
        };

        return (
          <>
            <div className="grid grid-cols-3 gap-5 mb-4">
              {onDuty.map(d => <DoctorCard key={d.id} doctor={d} />)}
            </div>
            {offDuty.length > 0 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowOffDuty(v => !v)}
                  className="flex items-center gap-2 text-xs text-[var(--neutral-500)] hover:text-[var(--neutral-700)] mb-3 transition-colors"
                >
                  <ChevronDown size={14} className={`transition-transform ${showOffDuty ? 'rotate-180' : ''}`} />
                  {offDuty.length} doctor{offDuty.length > 1 ? 's' : ''} unavailable today
                </button>
                {showOffDuty && (
                  <div className="grid grid-cols-3 gap-5">
                    {offDuty.map(d => <DoctorCard key={d.id} doctor={d} />)}
                  </div>
                )}
              </div>
            )}
          </>
        );
      })()}

      {/* Footer Action Bar */}
      {selectedDoctor && (
        <div className="fixed bottom-0 left-56 right-0 bg-white border-t border-[var(--neutral-200)] p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--neutral-600)]">
                Issuing token for <span className="font-semibold">{patient?.name}</span>
              </span>
              <Badge variant="returning">
                {selectedDoctor.name} • {selectedDoctor.specialty}
              </Badge>
            </div>
            <Button size="lg" onClick={handleIssueToken} variant="primary">
              Issue Token
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
