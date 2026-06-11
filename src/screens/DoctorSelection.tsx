import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Stethoscope, Users, Clock, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function DoctorSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, isNew } = location.state || {};
  const { doctors } = useApp();
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);

  const handleIssueToken = () => {
    if (selectedDoctor) {
      // Generate unique token using timestamp
      const uniqueToken = `OPD-${Date.now().toString().slice(-3)}`;

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
      {/* Progress Bar */}
      <div className="text-center mb-6">
        <div className="flex justify-center gap-2 mb-3">
          <div className="w-8 h-2 rounded-full bg-[var(--brand-500)]"></div>
          <div className="w-8 h-2 rounded-full bg-[var(--brand-500)]"></div>
          <div className="w-8 h-2 rounded-full bg-[var(--brand-500)]"></div>
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

      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-[var(--neutral-900)] mb-2">Select a Doctor</h2>
        <p className="text-[var(--neutral-600)]">Choose from available doctors on duty today</p>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {doctors.map((doctor) => {
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
                    {doctor.status === 'on-duty' ? 'ON DUTY' : 'OFF DUTY'}
                  </Badge>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[var(--brand-500)] flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-heading text-lg font-bold text-[var(--neutral-900)] mb-1">{doctor.name}</h3>
              <p className="text-sm text-[var(--neutral-600)] mb-4">{doctor.specialty}</p>

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
        })}
      </div>

      {/* Footer Action Bar */}
      {selectedDoctor && (
        <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[var(--neutral-200)] p-4">
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
