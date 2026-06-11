import { Button } from './ui/Button';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function TestDataButton() {
  const { addToken, doctors, tokens } = useApp();

  const addSampleTokens = () => {
    // Generate unique token number using timestamp
    const uniqueId = Date.now().toString().slice(-3);
    const tokenNumber = `OPD-${uniqueId}`;

    const onDutyDoctors = doctors.filter(d => d.status === 'on-duty');
    const randomDoctor = onDutyDoctors[Math.floor(Math.random() * onDutyDoctors.length)];

    const sampleTokens = [
      {
        id: `token-${Date.now()}-${Math.random()}`, // Unique ID for React key
        token: tokenNumber,
        patient: {
          name: 'Test Patient ' + uniqueId,
          age: '35',
          gender: 'Male',
          mobile: '9876543210',
          bloodGroup: 'O+',
          selectedConditions: []
        },
        doctor: randomDoctor,
        issuedAt: new Date().toISOString(),
        status: 'waiting' as const,
        urgent: false,
      },
    ];

    sampleTokens.forEach(token => addToken(token));
    toast.success(`Token ${tokenNumber} added! Check TV Display`);
  };

  return (
    <Button onClick={addSampleTokens} variant="ghost" size="sm">
      + Add Test Token
    </Button>
  );
}
