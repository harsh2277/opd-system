import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Stethoscope,
  Clock,
  Users,
  Phone,
  CheckCircle,
  AlertCircle,
  FileText,
  LogOut,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  queue: number;
  avgWait: number;
  status: 'on-duty' | 'off-duty';
}

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { tokens, updateTokenStatus } = useApp();
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState('00:00');

  useEffect(() => {
    // Check if doctor is logged in
    const doctorData = localStorage.getItem('current-doctor');
    if (!doctorData) {
      toast.error('Please login first');
      navigate('/doctor-login');
      return;
    }
    setCurrentDoctor(JSON.parse(doctorData));
  }, [navigate]);

  useEffect(() => {
    const startTime = new Date();
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setSessionDuration(`${hours}:${String(minutes).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentDoctor) {
    return null;
  }

  const myTokens = tokens.filter((t) => t.doctor.id === currentDoctor.id);
  const waitingTokens = myTokens.filter((t) => t.status === 'waiting');
  const currentToken = myTokens.find((t) => t.status === 'in-consultation');
  const doneTokens = myTokens.filter((t) => t.status === 'done');

  const handleCallNext = () => {
    const nextToken = waitingTokens[0];
    if (nextToken) {
      updateTokenStatus(nextToken.token, 'in-consultation');
      setSelectedPatient(nextToken.id);
      toast.success(`Calling ${nextToken.token}`);
    } else {
      toast.info('No patients in queue');
    }
  };

  const handleComplete = (tokenNumber: string) => {
    updateTokenStatus(tokenNumber, 'done');
    setSelectedPatient(null);
    toast.success('Consultation completed');
  };

  const handleViewDetails = (tokenId: string) => {
    setSelectedPatient(tokenId);
    navigate(`/doctor-patient/${tokenId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('current-doctor');
    toast.success('Logged out successfully');
    navigate('/doctor-login');
  };

  return (
    <div className="min-h-screen bg-[var(--neutral-50)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--neutral-200)] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--teal-500)] flex items-center justify-center">
              <Stethoscope size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--neutral-900)]">{currentDoctor.name}</h1>
              <p className="text-sm text-[var(--neutral-600)]">{currentDoctor.specialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-[var(--neutral-500)]">Session Duration</p>
              <p className="text-lg font-bold text-[var(--neutral-900)] font-mono">{sessionDuration}</p>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users size={24} className="text-[var(--warning-500)]" />
              <Badge variant="waiting">{waitingTokens.length}</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--neutral-900)]">{waitingTokens.length}</p>
            <p className="text-sm text-[var(--neutral-600)]">Waiting</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Stethoscope size={24} className="text-blue-500" />
              <Badge variant="active">{currentToken ? 1 : 0}</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--neutral-900)]">{currentToken ? 1 : 0}</p>
            <p className="text-sm text-[var(--neutral-600)]">In Consultation</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle size={24} className="text-[var(--success-500)]" />
              <Badge variant="done">{doneTokens.length}</Badge>
            </div>
            <p className="text-2xl font-bold text-[var(--neutral-900)]">{doneTokens.length}</p>
            <p className="text-sm text-[var(--neutral-600)]">Completed Today</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock size={24} className="text-[var(--neutral-500)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--neutral-900)]">{currentDoctor.avgWait} min</p>
            <p className="text-sm text-[var(--neutral-600)]">Avg. Wait Time</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Current Patient */}
          <Card className="p-6 col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--neutral-900)]">Current Patient</h2>
              {!currentToken && (
                <Button
                  onClick={handleCallNext}
                  disabled={waitingTokens.length === 0}
                  size="sm"
                  className="bg-[var(--teal-500)] hover:bg-[var(--teal-700)] flex items-center gap-2"
                >
                  <Phone size={16} />
                  Call Next
                </Button>
              )}
            </div>

            {currentToken ? (
              <div className="space-y-4">
                <div className="bg-[var(--teal-50)] border-2 border-[var(--teal-300)] rounded-xl p-6 text-center">
                  <p className="font-mono text-4xl font-bold text-[var(--teal-600)] mb-3">
                    {currentToken.token}
                  </p>
                  <Badge variant="active" className="mb-2">IN CONSULTATION</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Patient Name</p>
                    <p className="font-semibold text-[var(--neutral-900)]">{currentToken.patient.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-1">Age</p>
                      <p className="font-semibold text-[var(--neutral-900)]">{currentToken.patient.age}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-1">Gender</p>
                      <p className="font-semibold text-[var(--neutral-900)]">{currentToken.patient.gender}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Blood Group</p>
                    <p className="font-semibold text-[var(--neutral-900)]">{currentToken.patient.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Mobile</p>
                    <p className="font-semibold text-[var(--neutral-900)]">{currentToken.patient.mobile}</p>
                  </div>
                  {currentToken.patient.selectedConditions.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--neutral-500)] mb-1">Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {currentToken.patient.selectedConditions.map((condition) => (
                          <Badge key={condition} variant="urgent" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleViewDetails(currentToken.id)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <FileText size={16} />
                    View History
                  </Button>
                  <Button
                    onClick={() => handleComplete(currentToken.token)}
                    size="sm"
                    className="flex-1 bg-[var(--success-500)] hover:bg-[var(--success-700)] flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Complete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <User size={48} className="mx-auto mb-4 text-[var(--neutral-400)]" />
                <p className="text-[var(--neutral-600)] mb-4">No patient in consultation</p>
                {waitingTokens.length > 0 && (
                  <Button
                    onClick={handleCallNext}
                    className="bg-[var(--teal-500)] hover:bg-[var(--teal-700)] flex items-center gap-2 mx-auto"
                  >
                    <Phone size={16} />
                    Call Next Patient
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Waiting Queue */}
          <Card className="p-6 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--neutral-900)]">Your Queue</h2>
              <Badge variant="waiting" className="text-base px-4 py-1">
                {waitingTokens.length} waiting
              </Badge>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {waitingTokens.length > 0 ? (
                waitingTokens.map((token, index) => (
                  <Card
                    key={token.id}
                    className={`p-4 transition-all ${
                      token.urgent ? 'border-2 border-[var(--error-500)] bg-[var(--error-50)]' : 'border border-[var(--neutral-200)] hover:border-[var(--teal-400)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--teal-100)] flex items-center justify-center">
                          <span className="text-lg font-bold text-[var(--teal-700)]">{index + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-mono text-xl font-bold text-[var(--neutral-900)]">
                              {token.token}
                            </p>
                            {token.urgent && <Badge variant="urgent" className="text-xs">URGENT</Badge>}
                          </div>
                          <p className="font-semibold text-[var(--neutral-700)]">{token.patient.name}</p>
                          <p className="text-sm text-[var(--neutral-500)]">
                            {token.patient.age} • {token.patient.gender} • {token.patient.bloodGroup}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetails(token.id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <FileText size={16} />
                          View
                        </Button>
                        {index === 0 && (
                          <Button
                            onClick={() => {
                              updateTokenStatus(token.token, 'in-consultation');
                              setSelectedPatient(token.id);
                              toast.success(`Calling ${token.token}`);
                            }}
                            size="sm"
                            className="bg-[var(--teal-500)] hover:bg-[var(--teal-700)] flex items-center gap-2"
                          >
                            <Phone size={16} />
                            Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16">
                  <Users size={48} className="mx-auto mb-4 text-[var(--neutral-400)]" />
                  <p className="text-[var(--neutral-600)]">No patients in queue</p>
                  <p className="text-sm text-[var(--neutral-500)] mt-2">You're all caught up!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
