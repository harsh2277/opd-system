import { useState, useRef } from 'react';
import { CheckCircle, Clock, FileText, FlaskConical, User, Send, Search } from 'lucide-react';
import { useApp, Token } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function LabDashboard() {
  const { tokens, completeLabRequest, updateLabTest, addNotification } = useApp();
  const [selectedTokenNumber, setSelectedTokenNumber] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [reportNotes, setReportNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Draft notes per token so they survive patient switching
  const draftNotes = useRef<Record<string, string>>({});

  const filterTokens = (list: Token[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      t => t.patient.name.toLowerCase().includes(q) || t.token.toLowerCase().includes(q) || t.patient.mobile.includes(q)
    );
  };

  const allPendingLab = tokens.filter((t) => t.labTests && t.labTests.length > 0 && t.labStatus === 'pending');
  const allCompletedLab = tokens.filter((t) => t.labTests && t.labTests.length > 0 && t.labStatus === 'completed');
  const pendingLabTokens = filterTokens(allPendingLab);
  const completedLabTokens = filterTokens(allCompletedLab);
  const selectedToken = tokens.find((t) => t.token === selectedTokenNumber);

  const handleSelectToken = (token: Token) => {
    // Save current draft before switching
    if (selectedTokenNumber) {
      draftNotes.current[selectedTokenNumber] = reportNotes;
    }
    setSelectedTokenNumber(token.token);
    // Restore draft for the new token, or use saved report notes
    setReportNotes(draftNotes.current[token.token] ?? token.labReportNotes ?? '');
  };

  const handleNotesChange = (val: string) => {
    setReportNotes(val);
    if (selectedTokenNumber) draftNotes.current[selectedTokenNumber] = val;
  };

  const handleMarkTestDone = (testName: string) => {
    if (!selectedToken) return;
    updateLabTest(selectedToken.token, testName);
    toast.success(`${testName} marked complete`);
    // Check if all tests are now done — if so, prompt for report notes
    const updatedTests = (selectedToken.labTests || []).map(t =>
      t.name === testName ? { ...t, status: 'completed' as const } : t
    );
    const allDone = updatedTests.every(t => t.status === 'completed');
    if (allDone) {
      toast.info('All tests complete — add report notes and finalise');
    }
  };

  const handleCompleteReport = () => {
    if (!selectedToken) return;
    if (!reportNotes.trim()) {
      toast.error('Add report notes before finalising');
      return;
    }

    completeLabRequest(selectedToken.token, reportNotes.trim());
    addNotification(
      `Lab report completed for ${selectedToken.patient.name} (${selectedToken.token})`,
      'success'
    );
    toast.success('Lab report finalised and sent to doctor');
    setSelectedTokenNumber(null);
    setReportNotes('');
  };

  const visibleTokens = activeTab === 'pending' ? pendingLabTokens : completedLabTokens;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--neutral-900)]">Lab Requests</h1>
        <p className="text-xs text-[var(--neutral-500)] mt-0.5">View doctor-requested reports and update lab completion status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white border border-[var(--neutral-200)] rounded-xl overflow-hidden">
          <div className="flex border-b border-[var(--neutral-200)] bg-[var(--neutral-50)]">
            <button
              onClick={() => {
                setActiveTab('pending');
                setSelectedTokenNumber(null);
              }}
              className={`flex-1 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-normal sm:tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-[var(--brand-500)] text-[var(--brand-700)] bg-white'
                  : 'border-transparent text-[var(--neutral-500)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)]'
              }`}
            >
              <Clock size={14} />
              Pending Lab Reports ({pendingLabTokens.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('completed');
                setSelectedTokenNumber(null);
              }}
              className={`flex-1 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-normal sm:tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'completed'
                  ? 'border-[var(--brand-500)] text-[var(--brand-700)] bg-white'
                  : 'border-transparent text-[var(--neutral-500)] hover:text-[var(--neutral-900)] hover:bg-[var(--neutral-100)]'
              }`}
            >
              <CheckCircle size={14} />
              Completed Reports ({completedLabTokens.length})
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-2 border-b border-[var(--neutral-100)]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient, token, mobile..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[var(--neutral-200)] rounded-md bg-white focus:outline-none focus:border-[var(--brand-400)]"
              />
            </div>
          </div>

          <div className="p-4 min-h-[450px] max-h-[640px] overflow-y-auto">
            {visibleTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleTokens.map((token) => (
                  <div
                    key={token.token}
                    onClick={() => handleSelectToken(token)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedTokenNumber === token.token
                        ? 'border-[var(--brand-500)] bg-[var(--brand-50)] ring-1 ring-[var(--brand-500)]'
                        : 'border-[var(--neutral-200)] bg-white hover:border-[var(--brand-300)] hover:bg-[var(--neutral-50)]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono font-bold text-xs bg-[var(--brand-50)] border border-[var(--brand-200)] text-[var(--brand-700)] px-2 py-0.5 rounded">
                        {token.token}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${
                          token.labStatus === 'completed'
                            ? 'bg-[var(--success-50)] border-[var(--success-200)] text-[var(--success-700)]'
                            : 'bg-[var(--warning-50)] border-[var(--warning-200)] text-[var(--warning-500)]'
                        }`}
                      >
                        {token.labStatus === 'completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {token.labStatus === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-[var(--neutral-800)]">{token.patient.name}</h3>
                    <p className="text-xs text-[var(--neutral-500)] mt-1 flex items-center gap-1.5">
                      <span>Dr. {token.doctor.name}</span>
                      <span>·</span>
                      <span>{token.labTests?.length || 0} test(s)</span>
                    </p>
                    <div className="mt-3 pt-3 border-t border-[var(--neutral-100)]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-semibold text-[var(--neutral-400)] uppercase tracking-wider">Tests</p>
                        {token.labStatus === 'pending' && (
                          <span className="text-[10px] font-semibold text-[var(--brand-600)]">
                            {(token.labTests || []).filter(t => t.status === 'completed').length}/{token.labTests?.length} done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--neutral-700)] line-clamp-2">
                        {(token.labTests || []).map((test) => test.name).join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center text-[var(--neutral-400)]">
                <FlaskConical size={36} className="text-[var(--neutral-300)] mb-2" />
                <p className="text-sm">No {activeTab} lab reports found</p>
                <p className="text-xs text-[var(--neutral-400)] mt-0.5">Doctor lab requests will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedToken ? (
            <div className="bg-white border border-[var(--neutral-200)] rounded-xl p-5 space-y-5">
              <div className="border-b border-[var(--neutral-100)] pb-3">
                <span className="text-[10px] font-bold text-[var(--brand-500)] uppercase tracking-widest block mb-1">Lab Detail</span>
                <h2 className="text-base font-bold text-[var(--neutral-900)] flex items-center justify-between">
                  <span>{selectedToken.patient.name}</span>
                  <span className="font-mono text-xs bg-[var(--brand-50)] border border-[var(--brand-200)] text-[var(--brand-700)] px-2.5 py-0.5 rounded">
                    {selectedToken.token}
                  </span>
                </h2>
                <p className="text-xs text-[var(--neutral-500)] mt-1">
                  Requested by <span className="font-semibold text-[var(--neutral-800)]">Dr. {selectedToken.doctor.name}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[var(--neutral-200)] rounded-lg p-3">
                  <p className="text-[10px] text-[var(--neutral-400)] font-semibold uppercase tracking-wider">Patient</p>
                  <p className="text-xs text-[var(--neutral-700)] mt-1 flex items-center gap-1.5">
                    <User size={12} /> {selectedToken.patient.age} / {selectedToken.patient.gender}
                  </p>
                </div>
                <div className="border border-[var(--neutral-200)] rounded-lg p-3">
                  <p className="text-[10px] text-[var(--neutral-400)] font-semibold uppercase tracking-wider">Requested</p>
                  <p className="text-xs text-[var(--neutral-700)] mt-1">
                    {selectedToken.labRequestedAt
                      ? new Date(selectedToken.labRequestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : 'Today'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-[var(--neutral-500)] uppercase tracking-wider">Tests</h3>
                  <span className="text-[10px] text-[var(--neutral-400)]">
                    {(selectedToken.labTests || []).filter(t => t.status === 'completed').length} / {selectedToken.labTests?.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {(selectedToken.labTests || []).map((test, index) => {
                    const isDone = test.status === 'completed';
                    return (
                      <div
                        key={`${test.name}-${index}`}
                        className={`p-3 border rounded-lg flex items-center justify-between gap-2 transition-colors ${
                          isDone
                            ? 'bg-[var(--success-50)] border-[var(--success-200)]'
                            : 'bg-[var(--neutral-50)] border-[var(--neutral-100)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FlaskConical size={12} className={isDone ? 'text-[var(--success-600)]' : 'text-[var(--teal-500)]'} />
                          <div>
                            <p className={`text-xs font-semibold ${isDone ? 'text-[var(--success-700)] line-through decoration-1' : 'text-[var(--neutral-800)]'}`}>
                              {test.name}
                            </p>
                            {test.notes && <p className="text-[10px] text-[var(--neutral-500)]">{test.notes}</p>}
                            {isDone && test.completedAt && (
                              <p className="text-[10px] text-[var(--success-600)] mt-0.5">
                                Done {new Date(test.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                        {!isDone && selectedToken.labStatus === 'pending' && (
                          <button
                            onClick={() => handleMarkTestDone(test.name)}
                            className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 bg-[var(--brand-500)] hover:bg-[var(--brand-700)] text-white rounded-md transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                        {isDone && <CheckCircle size={14} className="text-[var(--success-500)] flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--neutral-500)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={12} /> Report Notes
                </label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Enter lab findings, values, or report summary..."
                  rows={5}
                  disabled={selectedToken.labStatus === 'completed'}
                  className="w-full px-3 py-2 text-xs border border-[var(--neutral-200)] rounded-md resize-none bg-white text-[var(--neutral-900)] focus:outline-none focus:border-[var(--brand-500)] disabled:bg-[var(--neutral-50)] disabled:text-[var(--neutral-500)]"
                />
              </div>

              {selectedToken.labStatus === 'pending' ? (
                <Button onClick={handleCompleteReport} className="w-full text-xs font-semibold h-10">
                  <Send size={14} />
                  Mark Lab Report Complete
                </Button>
              ) : (
                <div className="text-xs font-semibold text-[var(--success-700)] bg-[var(--success-50)] border border-[var(--success-200)] rounded-lg px-3 py-2 flex items-center justify-center gap-2">
                  <CheckCircle size={14} />
                  Report completed
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] border-dashed rounded-xl p-8 text-center text-[var(--neutral-400)] h-[380px] flex flex-col items-center justify-center">
              <FlaskConical size={32} className="text-[var(--neutral-300)] mb-2" />
              <h3 className="text-sm font-semibold text-[var(--neutral-700)]">Select Lab Request</h3>
              <p className="text-xs text-[var(--neutral-400)] mt-1 max-w-[220px] mx-auto">
                Pick a patient request from the list to view tests and update report notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
