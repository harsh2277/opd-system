import { useState } from 'react';
import { useApp, Token, Medicine } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  Package,
  User,
  ShoppingBag,
  Search,
} from 'lucide-react';

export function PharmacyDashboard() {
  const { tokens, dispensePrescription, addNotification } = useApp();
  const [selectedTokenNumber, setSelectedTokenNumber] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'dispensed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');

  // Edit states for currently selected prescription
  const [tempMedicines, setTempMedicines] = useState<Medicine[]>([]);
  const [newMed, setNewMed] = useState<Medicine>({ name: '', dosage: '', duration: '', instructions: '' });
  const [customBillAmount, setCustomBillAmount] = useState<number>(0);

  const allPending = tokens.filter(
    (t) => t.prescription && t.prescription.length > 0 && t.prescriptionStatus === 'pending'
  );
  const allDispensed = tokens.filter(
    (t) => t.prescription && t.prescriptionStatus === 'dispensed'
  );

  // Unique doctors across pending prescriptions for filter chips
  const pendingDoctors = ['All', ...Array.from(new Set(allPending.map(t => t.doctor.name)))];

  const applyFilters = (list: Token[]) => {
    return list
      .filter(t => doctorFilter === 'All' || t.doctor.name === doctorFilter)
      .filter(t => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return t.patient.name.toLowerCase().includes(q) || t.token.toLowerCase().includes(q) || t.patient.mobile.includes(q);
      })
      // Urgent patients first, then oldest first
      .sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      });
  };

  const pendingTokens = applyFilters(allPending);
  const dispensedTokens = applyFilters(allDispensed);

  const selectedToken = tokens.find((t) => t.token === selectedTokenNumber);

  const handleSelectToken = (token: Token) => {
    setSelectedTokenNumber(token.token);
    setTempMedicines(token.prescription || []);
    const estimatedCost = (token.prescription || []).length * 150 + 20; // 150 per med + 20 admin charge
    setCustomBillAmount(token.billingAmount || estimatedCost);
  };

  const handleAddMedicine = () => {
    if (!newMed.name || !newMed.dosage) {
      toast.error('Medicine name and dosage are required');
      return;
    }
    const updated = [...tempMedicines, newMed];
    setTempMedicines(updated);
    setCustomBillAmount(updated.length * 150 + 20);
    setNewMed({ name: '', dosage: '', duration: '', instructions: '' });
  };

  const handleRemoveMedicine = (index: number) => {
    const updated = tempMedicines.filter((_, i) => i !== index);
    setTempMedicines(updated);
    setCustomBillAmount(updated.length * 150 + 20);
  };

  const handleDispense = () => {
    if (!selectedToken) return;
    if (tempMedicines.length === 0) {
      toast.error('Prescription must have at least one medicine');
      return;
    }

    dispensePrescription(selectedToken.token, tempMedicines, customBillAmount);
    
    // Add real-time notification for admin
    addNotification(
      `Prescription delivered & Billing collected for ${selectedToken.patient.name} (${selectedToken.token}) - Total Paid: ₹${customBillAmount}`,
      'success'
    );

    toast.success(`Medicines dispensed and ₹${customBillAmount} collected successfully!`);
    setSelectedTokenNumber(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Pharmacy Portal</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Dispense doctor prescriptions and manage patient pharmacy billing</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Prescription Lists (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-4 bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-neutral-200 bg-neutral-50">
            <button
              onClick={() => {
                setActiveTab('pending');
                setSelectedTokenNumber(null);
              }}
              className={`flex-1 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-normal sm:tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'border-brand-500 text-brand-700 bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
              }`}
            >
              <Clock size={14} />
              Pending Prescriptions ({pendingTokens.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('dispensed');
                setSelectedTokenNumber(null);
              }}
              className={`flex-1 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-normal sm:tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'dispensed'
                  ? 'border-brand-500 text-brand-700 bg-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
              }`}
            >
              <CheckCircle size={14} />
              Dispensed History ({dispensedTokens.length})
            </button>
          </div>

          {/* Search + Doctor Filter */}
          <div className="px-4 pt-3 pb-2 space-y-2 border-b border-neutral-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, token, mobile..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md bg-white focus:outline-none focus:border-brand-400"
              />
            </div>
            {pendingDoctors.length > 2 && (
              <div className="flex flex-wrap gap-1.5">
                {pendingDoctors.map(doc => (
                  <button
                    key={doc}
                    onClick={() => setDoctorFilter(doc)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      doctorFilter === doc
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-700'
                    }`}
                  >
                    {doc === 'All' ? 'All Doctors' : `Dr. ${doc}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="p-4 min-h-[450px] max-h-[600px] overflow-y-auto">
            {activeTab === 'pending' ? (
              pendingTokens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTokens.map((t) => (
                    <div
                      key={t.token}
                      onClick={() => handleSelectToken(t)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedTokenNumber === t.token
                          ? 'border-brand-500 bg-brand-50/30 ring-1 ring-brand-500'
                          : 'border-neutral-200 bg-white hover:border-brand-300 hover:bg-neutral-50/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-xs bg-brand-50 border border-brand-200 text-brand-700 px-2 py-0.5 rounded">
                          {t.token}
                        </span>
                        <div className="flex items-center gap-1">
                          {t.urgent && (
                            <span className="text-[10px] font-bold bg-error-500 text-white px-2 py-0.5 rounded animate-pulse">
                              URGENT
                            </span>
                          )}
                          <span className="text-[10px] font-semibold bg-warning-50 border border-warning-200 text-warning-700 px-2 py-0.5 rounded">
                            Pending
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm text-neutral-800">{t.patient.name}</h3>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-neutral-600">
                          Dr. {t.doctor.name}
                        </span>
                        <span>·</span>
                        <span>{t.prescription?.length} Medicines</span>
                      </p>
                      <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between items-center text-[10px] text-neutral-400">
                        <span>Issued: {new Date(t.issuedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-semibold text-brand-700">₹{(t.prescription?.length || 0) * 150 + 20} est.</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-400">
                  <Package size={36} className="text-neutral-300 mb-2" />
                  <p className="text-sm">No pending prescriptions to dispense</p>
                  <p className="text-xs text-neutral-400 mt-0.5">They will appear here when a doctor saves a prescription</p>
                </div>
              )
            ) : dispensedTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dispensedTokens.map((t) => (
                  <div key={t.token} className="p-4 border border-neutral-200 bg-neutral-50/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono font-bold text-xs bg-neutral-100 border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                        {t.token}
                      </span>
                      <span className="text-[10px] font-semibold bg-success-50 border border-success-200 text-success-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle size={10} /> Dispensed
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-neutral-800">{t.patient.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Dispensed by Pharmacy · Dr. {t.doctor.name}
                    </p>
                    <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center text-[10px]">
                      <span className="text-neutral-400">Paid Amount:</span>
                      <span className="font-bold text-success-700">₹{t.billingAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-400">
                <CheckCircle size={36} className="text-neutral-300 mb-2" />
                <p className="text-sm">No dispensed history found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Prescription Details & Dispense Workspace */}
        <div className="space-y-4">
          {selectedToken ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-5 shadow-sm">
              <div className="border-b border-neutral-100 pb-3">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block mb-1">Prescription Detail</span>
                <h2 className="text-base font-bold text-neutral-900 flex items-center justify-between">
                  <span>{selectedToken.patient.name}</span>
                  <span className="font-mono text-xs bg-brand-50 border border-brand-200 text-brand-700 px-2.5 py-0.5 rounded">
                    {selectedToken.token}
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Prescribed by <span className="font-semibold text-neutral-800">Dr. {selectedToken.doctor.name}</span>
                </p>
              </div>

              {/* Medicine List Editor */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Medicines</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {tempMedicines.map((med, index) => (
                    <div key={index} className="flex justify-between items-center p-2.5 bg-neutral-50 border border-neutral-100 rounded-lg group">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-neutral-800 truncate">{med.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5 flex gap-1.5 flex-wrap">
                          <span>Dose: {med.dosage}</span>
                          {med.duration && <span>· Duration: {med.duration}</span>}
                          {med.instructions && <span className="text-brand-600">({med.instructions})</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveMedicine(index)}
                        className="text-neutral-400 hover:text-error-500 p-1 rounded hover:bg-neutral-100 cursor-pointer"
                        title="Remove Medicine"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new medicine row */}
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <p className="text-[10px] font-semibold text-neutral-400">Add Extra/Alternative Medicine</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Med Name"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      className="text-xs px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md focus:border-brand-500 focus:bg-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 1-0-1)"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="text-xs px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md focus:border-brand-500 focus:bg-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={newMed.duration}
                      onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                      className="text-xs px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md focus:border-brand-500 focus:bg-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={newMed.instructions}
                      onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                      className="text-xs px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md focus:border-brand-500 focus:bg-white outline-none"
                    />
                  </div>
                  <Button
                    onClick={handleAddMedicine}
                    variant="secondary"
                    className="w-full text-xs py-1 h-8 flex items-center justify-center gap-1 border border-brand-200"
                  >
                    <Plus size={12} /> Add Medicine
                  </Button>
                </div>
              </div>

              {/* Billing Details */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={13} /> Billing Summary
                </h3>
                <div className="space-y-1.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Medicines ({tempMedicines.length})</span>
                    <span>₹{tempMedicines.length * 150}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispensing & Admin Charge</span>
                    <span>₹20</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between font-bold text-neutral-900 text-sm">
                    <span>Total Bill</span>
                    <input
                      type="number"
                      value={customBillAmount}
                      onChange={(e) => setCustomBillAmount(Number(e.target.value))}
                      className="w-20 text-right bg-white border border-neutral-200 rounded px-1 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleDispense}
                className="w-full py-2.5 px-4 bg-success-500 hover:bg-success-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <ShoppingBag size={14} />
                Dispense & Collect Payment (₹{customBillAmount})
              </button>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-xl p-8 text-center text-neutral-400 h-[380px] flex flex-col items-center justify-center">
              <ShoppingBag size={32} className="text-neutral-300 mb-2 animate-bounce" />
              <h3 className="text-sm font-semibold text-neutral-700">Select Prescription</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-[200px] mx-auto">
                Pick a pending patient from the list on the left to start dispensing and collect payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
