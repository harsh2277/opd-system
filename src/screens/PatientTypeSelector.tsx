import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { UserPlus, UserCheck, ArrowLeft } from 'lucide-react';

export function PatientTypeSelector() {
  const navigate = useNavigate();

  const patientTypes = [
    {
      type: 'new',
      icon: UserPlus,
      title: 'New Patient',
      description: 'First time visiting our OPD. We will register them now.',
      time: 'Estimated time: 2 minutes',
      color: 'success',
      path: '/new-patient',
    },
    {
      type: 'returning',
      icon: UserCheck,
      title: 'Returning Patient',
      description: 'Visited before. Search by name, phone, or patient ID.',
      time: 'Estimated time: 30 seconds',
      color: 'brand',
      path: '/returning-patient',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="text-center mb-8">
        <div className="flex justify-center gap-2 mb-3">
          <div className="w-8 h-2 rounded-full bg-[var(--brand-500)]"></div>
          <div className="w-8 h-2 rounded-full bg-[var(--neutral-200)]"></div>
          <div className="w-8 h-2 rounded-full bg-[var(--neutral-200)]"></div>
        </div>
        <p className="text-lg text-[var(--neutral-700)]">
          <span className="font-semibold">Step 1 of 3</span> — Who is this patient?
        </p>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {patientTypes.map((type) => {
          const Icon = type.icon;
          const borderColor = type.color === 'success' ? 'var(--success-200)' : 'var(--brand-200)';
          const bgColor = type.color === 'success' ? 'var(--success-50)' : 'var(--brand-50)';
          const iconColor = type.color === 'success' ? 'var(--success-500)' : 'var(--brand-500)';
          const hoverBorder = type.color === 'success' ? 'var(--success-500)' : 'var(--brand-500)';

          return (
            <Card
              key={type.type}
              hover
              className="p-8 cursor-pointer transition-all duration-200 hover:scale-105"
              style={{
                borderColor: borderColor,
                backgroundColor: bgColor,
              }}
              onClick={() => navigate(type.path)}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: iconColor }}
                >
                  <Icon size={40} className="text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[var(--neutral-900)] mb-3">{type.title}</h3>
                <p className="text-[var(--neutral-600)] mb-4 min-h-[3rem]">{type.description}</p>
                <span className="text-xs px-3 py-1 rounded-full bg-white text-[var(--neutral-600)] border border-[var(--neutral-200)]">
                  {type.time}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Back Link */}
      <div className="text-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[var(--neutral-500)] hover:text-[var(--neutral-700)] inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
