import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Clock, UserPlus, Bell, X, CheckCircle, AlertCircle, Stethoscope } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

const statusLeftBorders = {
  'waiting': 'border-l-4 border-l-[var(--warning-400)]',
  'in-consultation': 'border-l-4 border-l-blue-500',
  'done': 'border-l-4 border-l-[var(--success-500)]',
  'skipped': 'border-l-4 border-l-[var(--neutral-400)]',
};

export function QueueManagement() {
  const navigate = useNavigate();
  const { tokens, sessionStartTime, currentToken, updateTokenStatus, markTokenUrgent, endSession } = useApp();
  const [sessionDuration, setSessionDuration] = useState('00:00');

  useEffect(() => {
    if (sessionStartTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - sessionStartTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setSessionDuration(`${hours}:${String(minutes).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionStartTime]);

  const handleCall = (tokenNumber: string) => {
    updateTokenStatus(tokenNumber, 'in-consultation');
    toast.success(`Notification sent to token ${tokenNumber}`);
  };

  const handleSkip = (tokenNumber: string) => {
    updateTokenStatus(tokenNumber, 'skipped');
    toast.info(`Token ${tokenNumber} skipped`);
  };

  const handleComplete = (tokenNumber: string) => {
    updateTokenStatus(tokenNumber, 'done');
    toast.success(`Token ${tokenNumber} marked as complete`);
  };

  const handleMarkUrgent = (tokenNumber: string) => {
    markTokenUrgent(tokenNumber);
    toast.warning(`Token ${tokenNumber} marked as urgent`);
  };

  const handleEndSession = () => {
    endSession();
    toast.success('Session ended');
  };

  const handleMoveToken = (tokenNumber: string, newStatus: 'waiting' | 'in-consultation' | 'done' | 'skipped') => {
    updateTokenStatus(tokenNumber, newStatus);
    toast.success(`Moved token ${tokenNumber} to ${newStatus === 'in-consultation' ? 'Consultation' : newStatus}`);
  };

  const waitingTokens = tokens
    .filter((t) => t.status === 'waiting')
    .sort((a, b) => Number(b.urgent) - Number(a.urgent));
  const consultationTokens = tokens.filter((t) => t.status === 'in-consultation');
  const doneTokens = tokens.filter((t) => t.status === 'done');
  const skippedTokens = tokens.filter((t) => t.status === 'skipped');

  const Column = ({
    title,
    items,
    status,
    borderColor,
    textColor,
  }: {
    title: string;
    items: typeof tokens;
    status: 'waiting' | 'in-consultation' | 'done' | 'skipped';
    borderColor: string;
    textColor: string;
  }) => (
    <div
      className="flex-1 flex flex-col bg-white border border-[var(--neutral-200)] rounded-xl overflow-hidden min-w-[250px]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const tokenNumber = e.dataTransfer.getData('text/plain');
        if (tokenNumber) {
          handleMoveToken(tokenNumber, status);
        }
      }}
    >
      <div className={`px-4 py-3 border-b-2 ${borderColor} bg-white flex items-center justify-between`}>
        <span className={`font-semibold text-xs uppercase tracking-wider ${textColor}`}>{title}</span>
        <span className="bg-[var(--neutral-100)] border border-[var(--neutral-200)] text-[var(--neutral-600)] px-2 py-0.5 rounded-md text-xs font-semibold">{items.length}</span>
      </div>
      <div className="p-3 space-y-3 min-h-[450px] bg-white overflow-y-auto max-h-[600px] flex-1">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id || item.token}
              draggable={status !== 'done'}
              onDragStart={status === 'done' ? undefined : (e) => {
                e.dataTransfer.setData('text/plain', item.token);
              }}
              className={`p-4 rounded-lg group border transition-all ${
                status === 'done' ? 'cursor-default opacity-85 select-none' : 'cursor-grab active:cursor-grabbing hover:border-brand-300'
              } ${
                statusLeftBorders[status]
              } ${
                item.urgent
                  ? 'bg-error-50 border-error-200'
                  : 'bg-white border-neutral-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-mono font-bold text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded">{item.token}</p>
                {item.urgent && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-error-500 text-white rounded animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
              <p className="font-medium text-sm text-neutral-900 mb-0.5">{item.patient.name}</p>
              <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
                <span className="font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                  {item.doctor.name}
                </span>
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-3">
                <Clock size={11} />
                <span>{new Date(item.issuedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-neutral-100 mt-3">
                {status === 'waiting' && (
                  <>
                    <button
                      onClick={() => handleCall(item.token)}
                      className="flex-1 py-1.5 px-3 bg-success-500 hover:bg-success-700 text-white rounded-md text-xs flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Bell size={12} />
                      Send Notification
                    </button>
                    {!item.urgent && (
                      <button
                        onClick={() => handleMarkUrgent(item.token)}
                        className="p-1.5 bg-warning-500 hover:bg-warning-600 text-white rounded-md text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
                        title="Mark Urgent"
                      >
                        <AlertCircle size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleSkip(item.token)}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 rounded-md text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
                      title="Skip"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
                {status === 'in-consultation' && (
                  <div className="flex-1 py-1.5 px-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs flex items-center justify-center gap-1.5 font-medium select-none">
                    <Stethoscope size={12} />
                    With Doctor
                  </div>
                )}
                {status === 'skipped' && (
                  <button
                    onClick={() => updateTokenStatus(item.token, 'waiting')}
                    className="flex-1 py-1.5 px-3 bg-brand-500 hover:bg-brand-700 text-white rounded-md text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1"
                  >
                    Re-add to Queue
                  </button>
                )}
                {status === 'done' && (
                  <div className="flex-1 py-1.5 px-3 bg-success-50 text-success-700 border border-success-200 rounded-md text-xs flex items-center justify-center gap-1.5 font-semibold select-none">
                    <CheckCircle size={12} />
                    Completed & Locked
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-xs text-neutral-400">
            No tokens in this status
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Session Info Bar */}
      <div className="p-4 bg-white border border-[var(--neutral-200)] rounded-lg text-[var(--neutral-800)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[var(--neutral-500)]" />
            <span className="text-sm font-medium">
              {sessionStartTime
                ? `Session started ${sessionStartTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} (${sessionDuration})`
                : 'No active session'}
            </span>
          </div>
          <div className="font-mono text-sm font-semibold bg-[var(--brand-50)] text-[var(--brand-700)] px-3 py-1 rounded-md border border-[var(--brand-200)]">
            {currentToken ? `Serving Token: ${currentToken}` : 'No active consultations'}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="line"
                size="sm"
                className="border-[var(--error-200)] text-[var(--error-600)] hover:bg-[var(--error-50)]"
              >
                End Session
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End OPD Session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will close the current session. Patients still in the queue will remain but no new tokens can be issued until a new session starts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEndSession}
                  className="bg-[var(--error-500)] hover:bg-[var(--error-700)] text-white"
                >
                  Yes, End Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-semibold text-xl text-[var(--neutral-900)]">Today's Queue</h2>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">Manage and drag-and-drop token states in real-time</p>
        </div>
        <Button
          onClick={() => navigate('/patient-type')}
          variant="primary"
          className="flex items-center gap-1.5 text-xs py-2 h-9"
        >
          <UserPlus size={14} />
          New Check-in
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        <Column
          title="WAITING"
          items={waitingTokens}
          status="waiting"
          borderColor="border-[var(--warning-500)]"
          textColor="text-[var(--warning-700)]"
        />
        <Column
          title="IN CONSULTATION"
          items={consultationTokens}
          status="in-consultation"
          borderColor="border-blue-500"
          textColor="text-blue-700"
        />
        <Column
          title="DONE"
          items={doneTokens}
          status="done"
          borderColor="border-[var(--success-500)]"
          textColor="text-[var(--success-700)]"
        />
        <Column
          title="SKIPPED"
          items={skippedTokens}
          status="skipped"
          borderColor="border-[var(--neutral-400)]"
          textColor="text-[var(--neutral-700)]"
        />
      </div>
    </div>
  );
}
