import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check, Printer, Phone, ArrowRight, Clock, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

export function TokenReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, doctor, isNew, token } = location.state || {};
  const { addToken } = useApp();
  const [hasAddedToken, setHasAddedToken] = useState(false);
  const [isIssued, setIsIssued] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card'>('upi');

  const fee = isNew ? 500 : 300;

  // Generate unique token if not provided - MUST be before useEffect
  const displayToken = token || `OPD-${Date.now().toString().slice(-3)}`;

  const handleIssueToken = (payNow: boolean) => {
    if (patient && doctor && !hasAddedToken) {
      addToken({
        id: `token-${Date.now()}-${Math.random()}`,
        token: displayToken,
        patient,
        doctor,
        issuedAt: new Date().toISOString(),
        status: 'waiting',
        urgent: false,
        billingStatus: 'pending',
        billingAmount: fee,
        isNewPatient: !!isNew,
        consultationPaid: payNow,
        paymentMethod: payNow ? paymentMode : undefined,
      });
      setHasAddedToken(true);
      setIsPaid(payNow);
      setIsIssued(true);
      if (payNow) {
        toast.success(`Payment ₹${fee} settled! Token ${displayToken} issued.`);
      } else {
        toast.success(`Token ${displayToken} issued. Payment deferred.`);
      }
    }
  };

  const handlePrint = () => {
    toast.success('Token sent to printer');
  };

  const handleSMS = () => {
    toast.success(`SMS sent to ${patient?.mobile || 'patient'}`);
  };

  const handleNewCheckin = () => {
    navigate('/patient-type');
  };

  const handleBackToQueue = () => {
    navigate('/queue');
  };

  return (
    <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full overflow-hidden shadow-sm">
        {/* Top Accent Bar */}
        <div className="h-2 bg-[var(--teal-500)]"></div>

        <div className="p-10">
          {!isIssued ? (
            <div className="space-y-6">
              {/* Review Checkin Details */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--brand-50)] flex items-center justify-center mx-auto mb-3">
                  <CreditCard size={22} className="text-[var(--brand-500)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--neutral-900)]">Complete Check-in & Payment</h2>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">Please collect fees and issue the patient token</p>
              </div>

              {/* Patient & Doctor Preview Info */}
              <div className="grid grid-cols-2 gap-6 p-5 bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-xl">
                <div className="text-center border-r border-[var(--neutral-200)]">
                  <p className="text-[10px] uppercase font-bold text-[var(--neutral-400)] tracking-wider mb-1.5">Patient Details</p>
                  <p className="font-bold text-sm text-[var(--neutral-800)]">{patient?.name || 'Patient Name'}</p>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">{patient?.age} yrs · {patient?.gender}</p>
                  <div className="mt-2">
                    <Badge variant={isNew ? 'new' : 'returning'}>{isNew ? 'NEW PATIENT' : 'RETURNING PATIENT'}</Badge>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-[var(--neutral-400)] tracking-wider mb-1.5">Assigned Doctor</p>
                  <p className="font-bold text-sm text-[var(--neutral-800)]">Dr. {doctor?.name || 'Doctor Name'}</p>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">{doctor?.specialty || 'Specialty'}</p>
                  <p className="text-[10px] text-[var(--neutral-400)] mt-2">Wait: ~{doctor?.avgWait || 15} mins</p>
                </div>
              </div>

              {/* Upfront Billing Collection Panel */}
              <div className="p-5 border border-[var(--neutral-200)] rounded-xl space-y-4 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--neutral-150)]">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[var(--neutral-500)]" />
                    <div>
                      <p className="text-xs font-bold text-[var(--neutral-700)] uppercase tracking-wider">OPD Consultation Settle</p>
                      <p className="text-[10px] text-[var(--neutral-400)] mt-0.5">
                        {isNew ? 'Registration Fee + Consultation Charge' : 'Consultation Fee'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-base text-[var(--neutral-900)]">₹{fee}</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--neutral-500)] uppercase tracking-wider block">Payment Mode</label>
                  <div className="flex gap-2">
                    {(['upi', 'cash', 'card'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMode(mode)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-md border transition-all text-center uppercase ${
                          paymentMode === mode
                            ? 'border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)]'
                            : 'border-[var(--neutral-200)] text-[var(--neutral-600)] bg-white hover:bg-[var(--neutral-50)]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex pt-2">
                  <Button 
                    onClick={() => handleIssueToken(true)}
                    className="w-full text-xs h-10 font-bold"
                  >
                    Pay ₹{fee} & Issue Token
                  </Button>
                </div>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={handleBackToQueue}
                  className="text-xs text-[var(--neutral-500)] hover:underline"
                >
                  Cancel Check-in
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-[var(--success-100)] flex items-center justify-center">
                  <Check size={28} className="text-[var(--success-500)]" />
                </div>
              </div>

              <h2 className="font-heading text-xl font-bold text-[var(--success-700)] text-center mb-6">
                Token Issued Successfully!
              </h2>

              {/* Token Display */}
              <div className="text-center mb-6">
                <p className="text-xs uppercase tracking-wider text-[var(--neutral-400)] mb-2">TOKEN NUMBER</p>
                <div className="bg-[var(--teal-50)] rounded-2xl py-6 px-10 inline-block border border-[var(--teal-100)]">
                  <p className="font-mono text-6xl font-bold text-[var(--teal-700)]">{displayToken}</p>
                </div>
                <div className="mt-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    isPaid 
                      ? 'bg-[var(--success-50)] border-[var(--success-200)] text-[var(--success-700)]' 
                      : 'bg-[var(--warning-50)] border-[var(--warning-200)] text-[var(--warning-600)]'
                  }`}>
                    {isPaid ? `✓ Paid (₹${fee})` : `⚠️ Payment Pending (₹${fee})`}
                  </span>
                </div>
              </div>

              {/* Patient & Doctor Confirmation Info */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-[var(--neutral-200)]">
                <div className="text-center">
                  <p className="text-xs uppercase text-[var(--neutral-400)] mb-1">Patient</p>
                  <p className="font-bold text-sm text-[var(--neutral-900)] mb-1">{patient?.name}</p>
                  <Badge variant={isNew ? 'new' : 'returning'}>{isNew ? 'NEW' : 'RETURNING'}</Badge>
                </div>

                <div className="text-center border-l border-[var(--neutral-200)]">
                  <p className="text-xs uppercase text-[var(--neutral-400)] mb-1">Doctor</p>
                  <p className="font-bold text-sm text-[var(--neutral-900)] mb-0.5">Dr. {doctor?.name}</p>
                  <p className="text-xs text-[var(--neutral-600)]">{doctor?.specialty}</p>
                </div>
              </div>

              {/* Wait Time Info */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Clock size={16} className="text-[var(--neutral-600)]" />
                  <p className="text-sm text-[var(--neutral-700)]">
                    <span className="font-semibold">Estimated wait:</span> ~{doctor?.avgWait || 15} minutes
                  </p>
                </div>
                <p className="text-xs text-[var(--neutral-500)]">
                  Queue position: {(doctor?.queue || 3) + 1}th in line
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button variant="ghost" size="lg" onClick={handlePrint} className="h-10 text-xs">
                  <Printer size={16} className="mr-1.5" />
                  Print Token
                </Button>
                <Button variant="ghost" size="lg" onClick={handleSMS} className="h-10 text-xs">
                  <Phone size={16} className="mr-1.5" />
                  Send SMS
                </Button>
                <Button size="lg" onClick={handleNewCheckin} className="bg-[var(--teal-500)] hover:bg-[var(--teal-700)] h-10 text-xs font-semibold">
                  New Check-in
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={handleBackToQueue}
                  className="text-[var(--brand-500)] hover:underline text-xs font-semibold"
                >
                  Back to Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
