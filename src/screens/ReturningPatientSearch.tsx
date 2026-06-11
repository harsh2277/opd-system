import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, UserPlus, User } from 'lucide-react';
import { mockPatients } from '../data/mockPatients';

export function ReturningPatientSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobile.includes(searchTerm) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedPatient) {
      navigate('/doctor-selection', { state: { patient: selectedPatient, isNew: false } });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="text-center mb-6">
        <div className="flex justify-center gap-2 mb-3">
          <div className="w-8 h-2 rounded-full bg-[var(--brand-500)]"></div>
          <div className="w-8 h-2 rounded-full bg-[var(--brand-500)]"></div>
          <div className="w-8 h-2 rounded-full bg-[var(--neutral-200)]"></div>
        </div>
        <p className="text-lg text-[var(--neutral-700)]">
          <span className="font-semibold">Step 2 of 3</span> — Find Patient
        </p>
      </div>

      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl font-bold text-[var(--neutral-900)] mb-2">Find Patient</h2>
        <p className="text-[var(--neutral-600)]">Search by name, mobile number, or patient ID</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] z-10" size={20} />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type name or 10-digit mobile number..."
          variant="primary"
          className="pl-11 h-12 text-sm bg-white"
        />
      </div>

      {/* Results */}
      {searchTerm.length > 0 && (
        <Card className="mb-6 overflow-hidden">
          {filteredPatients.length > 0 ? (
            <div className="divide-y divide-[var(--neutral-100)]">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className="w-full p-4 hover:bg-[var(--brand-50)] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--brand-100)] flex items-center justify-center flex-shrink-0">
                      <User size={24} className="text-[var(--brand-500)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--neutral-900)]">{patient.name}</p>
                      <p className="text-sm text-[var(--neutral-600)]">
                        {patient.age} years • {patient.gender} • Last visit: {patient.lastVisit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-[var(--neutral-600)]">{patient.mobile}</p>
                      <p className="text-xs text-[var(--neutral-400)]">{patient.id}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[var(--neutral-100)] flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-[var(--neutral-400)]" />
              </div>
              <p className="text-lg font-medium text-[var(--neutral-700)] mb-2">No patient found for this search</p>
              <p className="text-[var(--neutral-500)] mb-4">Check the name or mobile number</p>
              <Button onClick={() => navigate('/new-patient')}>
                <UserPlus size={20} className="mr-2" />
                Register as New Patient
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Confirmation Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-8">
            <h3 className="font-heading text-2xl font-bold text-[var(--neutral-900)] mb-6 text-center">
              Confirm Patient Identity
            </h3>

            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[var(--brand-100)] flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-[var(--brand-500)]" />
              </div>
              <h4 className="font-heading text-xl font-bold text-[var(--neutral-900)] mb-2">{selectedPatient.name}</h4>
              <p className="text-[var(--neutral-600)] mb-2">
                {selectedPatient.age} years • {selectedPatient.gender}
              </p>
              <p className="font-mono text-[var(--neutral-600)] mb-2">+91 {selectedPatient.mobile}</p>
              <p className="text-sm text-[var(--neutral-500)]">Patient ID: {selectedPatient.id}</p>
              <p className="text-sm text-[var(--neutral-500)]">Last visit: {selectedPatient.lastVisit}</p>
            </div>

            <p className="text-center font-semibold text-[var(--neutral-700)] mb-6">Is this the correct patient?</p>

            <div className="flex gap-4">
              <Button variant="line" onClick={() => setSelectedPatient(null)} className="flex-1">
                No, Search Again
              </Button>
              <Button variant="primary" onClick={handleConfirm} className="flex-1">
                Yes, Continue
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="text-center mt-6">
        <Button
          variant="line"
          onClick={() => navigate(-1)}
          className="text-xs"
        >
          Back to Patient Type
        </Button>
      </div>
    </div>
  );
}
