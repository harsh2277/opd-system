import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { User, ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { mockPatients } from '../data/mockPatients';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const conditions = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid'];

export function NewPatientForm() {
  const navigate = useNavigate();
  const { tokens } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    mobile: '',
    bloodGroup: 'A+',
    selectedConditions: [] as string[],
    address: '',
  });
  const [customCondition, setCustomCondition] = useState('');

  const handleConditionToggle = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedConditions: prev.selectedConditions.includes(condition)
        ? prev.selectedConditions.filter((c) => c !== condition)
        : [...prev.selectedConditions, condition],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      toast.error('Please enter a valid age');
      return;
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // Duplicate detection — check live tokens and mock patients by mobile
    const liveMatch = tokens.find((t) => t.patient.mobile === formData.mobile);
    const mockMatch = mockPatients.find((p) => p.mobile === formData.mobile);
    if (liveMatch || mockMatch) {
      const existing = liveMatch?.patient || mockMatch!;
      toast.warning(`Mobile already registered to ${existing.name}. Use "Returning Patient" instead.`);
      return;
    }

    toast.success('Patient registered successfully!');
    navigate('/doctor-selection', { state: { patient: formData, isNew: true } });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-2 mb-4">
          {[
            { label: 'Patient Type', num: 1, state: 'done' as const, onClick: () => navigate('/patient-type') },
            { label: 'Details', num: 2, state: 'active' as const, onClick: undefined },
            { label: 'Doctor', num: 3, state: 'upcoming' as const, onClick: undefined },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && <div className="w-10 h-px bg-[var(--neutral-200)]" />}
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
          <span className="font-semibold">Step 2 of 3</span> — Patient Details
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="col-span-2">
          <Card className="p-8">
            <h2 className="font-heading text-2xl font-bold text-[var(--neutral-900)] mb-6">Register New Patient</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter patient's full name"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Age *"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Years"
                  required
                />

                <div>
                  <label className="text-sm font-medium text-[var(--neutral-700)] mb-2 block">Gender *</label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <Button
                        key={gender}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender })}
                        variant={formData.gender === gender ? 'primary' : 'line'}
                        className="flex-1 text-xs"
                      >
                        {gender}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--neutral-700)] mb-2 block">Mobile Number *</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-3 border-2 border-[var(--neutral-200)] rounded-lg bg-[var(--neutral-50)]">
                    <span className="text-sm font-medium text-[var(--neutral-600)]">+91</span>
                  </div>
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, mobile: value });
                    }}
                    placeholder="10-digit mobile number"
                    className="flex-1"
                    required
                  />
                </div>
                {formData.mobile.length === 10 && (() => {
                  const liveMatch = tokens.find((t) => t.patient.mobile === formData.mobile);
                  const mockMatch = mockPatients.find((p) => p.mobile === formData.mobile);
                  const existing = liveMatch?.patient || mockMatch;
                  return existing ? (
                    <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-[var(--warning-50)] border border-[var(--warning-200)]">
                      <AlertTriangle size={14} className="text-[var(--warning-600)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-[var(--warning-700)]">Mobile already registered</p>
                        <p className="text-[10px] text-[var(--warning-600)]">
                          {existing.name} · {existing.age} yrs · {existing.gender} — use Returning Patient instead
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--neutral-700)] mb-2 block">Blood Group *</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[var(--neutral-200)] rounded-lg bg-white focus:outline-none focus:border-[var(--brand-500)]"
                  required
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--neutral-700)] mb-2 block">Known Conditions</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {conditions.map((condition) => (
                    <Button
                      key={condition}
                      type="button"
                      onClick={() => handleConditionToggle(condition)}
                      variant={formData.selectedConditions.includes(condition) ? 'secondary' : 'line'}
                      className="text-xs"
                    >
                      {condition}
                    </Button>
                  ))}
                  {/* Custom added conditions as removable chips */}
                  {formData.selectedConditions
                    .filter((c) => !conditions.includes(c))
                    .map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--brand-50)] border border-[var(--brand-200)] text-[var(--brand-700)]"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => handleConditionToggle(c)}
                          className="text-[var(--brand-400)] hover:text-[var(--brand-700)] leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
                {/* Custom condition input */}
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={customCondition}
                    onChange={(e) => setCustomCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = customCondition.trim();
                        if (val && !formData.selectedConditions.includes(val)) {
                          setFormData((prev) => ({ ...prev, selectedConditions: [...prev.selectedConditions, val] }));
                        }
                        setCustomCondition('');
                      }
                    }}
                    placeholder="Other condition…"
                    className="flex-1 px-3 py-1.5 text-xs border border-[var(--neutral-200)] rounded-md focus:outline-none focus:border-[var(--brand-400)] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = customCondition.trim();
                      if (val && !formData.selectedConditions.includes(val)) {
                        setFormData((prev) => ({ ...prev, selectedConditions: [...prev.selectedConditions, val] }));
                      }
                      setCustomCondition('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] text-[var(--neutral-700)] transition-colors border border-[var(--neutral-200)]"
                  >
                    Add
                  </button>
                </div>
              </div>

              <Input
                label="Address (Optional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="line" onClick={() => navigate(-1)}>
                  <ArrowLeft size={16} className="mr-1.5" />
                  Back
                </Button>
                <Button type="submit" variant="primary" className="flex-1" size="lg">
                  Register & Continue
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Column */}
        <div>
          <Card className="p-6 sticky top-6">
            <h3 className="text-sm font-medium text-[var(--neutral-500)] mb-4">Patient Preview</h3>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-[var(--brand-100)] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--brand-700)]">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : <User size={32} />}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Badge variant="new" className="mb-2">
                  NEW
                </Badge>
                <h4 className="font-heading text-lg font-bold text-[var(--neutral-900)] mb-1">
                  {formData.name || 'Patient Name'}
                </h4>
                <div className="flex justify-center gap-2 mb-2">
                  {formData.age && <span className="text-sm text-[var(--neutral-600)]">{formData.age} years</span>}
                  {formData.gender && <span className="text-sm text-[var(--neutral-600)]">• {formData.gender}</span>}
                </div>
                {formData.mobile && (
                  <p className="text-sm font-mono text-[var(--neutral-600)] mb-2">+91 {formData.mobile}</p>
                )}
                {formData.bloodGroup && (
                  <Badge variant="returning" className="mb-2">
                    {formData.bloodGroup}
                  </Badge>
                )}
              </div>

              {formData.selectedConditions.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--neutral-500)] mb-2">Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.selectedConditions.map((condition) => (
                      <span
                        key={condition}
                        className="text-xs px-2 py-1 rounded-full bg-[var(--warning-100)] text-[var(--warning-500)]"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--neutral-200)]">
                <p className="text-xs text-[var(--neutral-400)] text-center">
                  Patient ID will be assigned on save
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
