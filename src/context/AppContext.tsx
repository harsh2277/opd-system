import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  medicines: Medicine[];
}

export interface Appointment {
  id: string;
  patientName: string;
  patientMobile: string;
  patientAge?: string;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  notes?: string;
  status: 'scheduled' | 'arrived' | 'cancelled';
  createdAt: string;
}

export interface LabTestRequest {
  name: string;
  notes?: string;
  status?: 'pending' | 'completed';
  completedAt?: string;
}

interface Patient {
  id?: string;
  name: string;
  age: string;
  gender: string;
  mobile: string;
  bloodGroup: string;
  selectedConditions: string[];
  address?: string;
  lastVisit?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  queue: number;
  avgWait: number;
  status: 'on-duty' | 'off-duty' | 'break' | 'lunch';
}

export interface Token {
  id: string;
  token: string;
  patient: Patient;
  doctor: Doctor;
  issuedAt: string;
  status: 'waiting' | 'in-consultation' | 'done' | 'skipped';
  calledAt?: string;
  smsSentAt?: string;
  urgent: boolean;
  prescription?: Medicine[];
  prescriptionStatus?: 'pending' | 'dispensed';
  billingStatus?: 'pending' | 'paid';
  billingAmount?: number;
  vitals?: { bp: string; temp: string; pulse: string; weight: string };
  pharmacySentAt?: string;
  labTests?: LabTestRequest[];
  labStatus?: 'pending' | 'completed';
  labRequestedAt?: string;
  labCompletedAt?: string;
  labReportNotes?: string;
  isNewPatient?: boolean;
  consultationPaid?: boolean;
  prescriptionPaid?: boolean;
  labPaid?: boolean;
  paymentMethod?: 'upi' | 'cash' | 'card';
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
  unread: boolean;
}

interface AppContextType {
  tokens: Token[];
  doctors: Doctor[];
  sessionStartTime: Date | null;
  currentToken: string | null;
  notifications: Notification[];
  prescriptionTemplates: PrescriptionTemplate[];
  appointments: Appointment[];
  addToken: (token: Token) => Promise<boolean>;
  addDoctor: (doctor: Doctor) => void;
  updateTokenStatus: (tokenNumber: string, status: Token['status']) => void;
  updateDoctorStatus: (doctorId: string, status: Doctor['status']) => void;
  markTokenUrgent: (tokenNumber: string) => void;
  startSession: () => void;
  endSession: () => void;
  callNextToken: (doctorId: string) => void;
  callToken: (tokenNumber: string) => void;
  sendSMS: (tokenNumber: string) => void;
  addPrescription: (tokenNumber: string, medicines: Medicine[]) => void;
  dispensePrescription: (tokenNumber: string, updatedMedicines: Medicine[], amount: number) => void;
  settleBilling: (tokenNumber: string, consultationPaid: boolean, prescriptionPaid: boolean, labPaid: boolean, amount: number, paymentMethod?: 'upi' | 'cash' | 'card') => void;
  requestLabTests: (tokenNumber: string, tests: LabTestRequest[]) => void;
  completeLabRequest: (tokenNumber: string, reportNotes: string) => void;
  updateLabTest: (tokenNumber: string, testName: string) => void;
  addNotification: (text: string, type?: Notification['type']) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
  saveVitals: (tokenNumber: string, vitals: { bp: string; temp: string; pulse: string; weight: string }) => void;
  sendToPharmacy: (tokenNumber: string, medicines: Medicine[]) => void;
  savePrescriptionTemplate: (name: string, medicines: Medicine[]) => void;
  deletePrescriptionTemplate: (id: string) => void;
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialDoctors: Doctor[] = [
  { id: 'D001', name: 'Dr. Sharma', specialty: 'General Physician', queue: 0, avgWait: 15, status: 'on-duty' },
  { id: 'D002', name: 'Dr. Patel', specialty: 'Cardiologist', queue: 0, avgWait: 12, status: 'on-duty' },
  { id: 'D003', name: 'Dr. Kumar', specialty: 'Pediatrician', queue: 0, avgWait: 8, status: 'on-duty' },
  { id: 'D004', name: 'Dr. Singh', specialty: 'Dermatologist', queue: 0, avgWait: 10, status: 'on-duty' },
  { id: 'D005', name: 'Dr. Mehta', specialty: 'Orthopedic', queue: 0, avgWait: 0, status: 'off-duty' },
  { id: 'D006', name: 'Dr. Rao', specialty: 'ENT Specialist', queue: 0, avgWait: 20, status: 'on-duty' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('opd-session-start');
    return saved ? new Date(saved) : null;
  });
  const [currentToken, setCurrentToken] = useState<string | null>(() => {
    return localStorage.getItem('opd-current-token');
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prescriptionTemplates, setPrescriptionTemplates] = useState<PrescriptionTemplate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load from backend APIs on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchJSON = async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || err.message || `HTTP ${res.status}`);
          }
          return res.json();
        };

        let tokensRes: any[] = [];
        let doctorsRes: any[] = [];
        let apptsRes: any[] = [];
        let templatesRes: any[] = [];
        let notifsRes: any[] = [];

        try { tokensRes = await fetchJSON('/api/tokens'); } catch(e) { console.error('Error loading tokens:', e); }
        try { doctorsRes = await fetchJSON('/api/doctors'); } catch(e) { console.error('Error loading doctors:', e); }
        try { apptsRes = await fetchJSON('/api/appointments'); } catch(e) { console.error('Error loading appointments:', e); }
        try { templatesRes = await fetchJSON('/api/templates'); } catch(e) { console.error('Error loading templates:', e); }
        try { notifsRes = await fetchJSON('/api/notifications'); } catch(e) { console.error('Error loading notifications:', e); }
        
        const mappedDoctors = (doctorsRes && Array.isArray(doctorsRes) ? doctorsRes : []).map((d: any) => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          status: d.status,
          queue: 0,
          avgWait: 15
        }));

        const safeParse = (val: any) => {
          if (!val) return null;
          if (typeof val === 'object') return val;
          try {
            return JSON.parse(val);
          } catch (e) {
            console.error('Failed to parse JSON field:', val, e);
            return null;
          }
        };

        const mappedTokens = (tokensRes && Array.isArray(tokensRes) ? tokensRes : []).map((t: any) => ({
          id: t.id,
          token: t.token_number,
          patient: {
            id: t.patient_id,
            name: t.patient_name,
            age: t.patient_age,
            gender: t.patient_gender,
            mobile: t.patient_mobile,
            bloodGroup: t.patient_blood_group,
            selectedConditions: t.patient_selected_conditions || [],
            address: t.patient_address
          },
          doctor: mappedDoctors.find((d: any) => d.id === t.doctor_id) || { id: t.doctor_id, name: 'Doctor', specialty: '', queue: 0, avgWait: 15, status: 'on-duty' },
          issuedAt: t.issued_at,
          status: t.status,
          calledAt: t.called_at,
          smsSentAt: t.sms_sent_at,
          urgent: t.urgent,
          prescription: safeParse(t.prescription),
          prescriptionStatus: t.prescription_status,
          billingStatus: t.billing_status,
          billingAmount: Number(t.billing_amount),
          vitals: safeParse(t.vitals),
          pharmacySentAt: t.pharmacy_sent_at,
          labTests: safeParse(t.lab_tests),
          labStatus: t.lab_status,
          labRequestedAt: t.lab_requested_at,
          labCompletedAt: t.lab_completed_at,
          labReportNotes: t.lab_report_notes,
          isNewPatient: t.is_new_patient,
          consultationPaid: t.consultation_paid,
          prescriptionPaid: t.prescription_paid,
          labPaid: t.lab_paid,
          paymentMethod: t.payment_method
        }));

        setDoctors(mappedDoctors.length > 0 ? mappedDoctors : initialDoctors);
        setTokens(mappedTokens);
        setAppointments((apptsRes && Array.isArray(apptsRes) ? apptsRes : []).map((a: any) => ({
          id: a.id,
          patientName: a.patient_name,
          patientMobile: a.patient_mobile,
          patientAge: a.patient_age,
          patientGender: a.patient_gender,
          doctorId: a.doctor_id,
          doctorName: a.doctor_name,
          date: a.date,
          time: a.time,
          notes: a.notes,
          status: a.status,
          createdAt: a.created_at
        })));
        setPrescriptionTemplates((templatesRes && Array.isArray(templatesRes) ? templatesRes : []).map((t: any) => ({
          id: t.id,
          name: t.name,
          medicines: typeof t.medicines === 'string' ? JSON.parse(t.medicines) : t.medicines
        })));
        setNotifications(notifsRes && Array.isArray(notifsRes) ? notifsRes : []);
      } catch (err) {
        console.error('Failed to fetch initial state from Neon backend:', err);
      }
    };
    loadData();
  }, []);

  // Save session states to localStorage
  useEffect(() => {
    if (sessionStartTime) {
      localStorage.setItem('opd-session-start', sessionStartTime.toISOString());
    } else {
      localStorage.removeItem('opd-session-start');
    }
  }, [sessionStartTime]);

  useEffect(() => {
    if (currentToken) {
      localStorage.setItem('opd-current-token', currentToken);
    } else {
      localStorage.removeItem('opd-current-token');
    }
  }, [currentToken]);

  // Update doctor queue counts reactively from live tokens
  useEffect(() => {
    setDoctors(prev => prev.map(doctor => ({
      ...doctor,
      queue: tokens.filter(t => t.doctor?.id === doctor.id && t.status === 'waiting').length,
    })));
  }, [tokens]);

  const addToken = async (token: Token): Promise<boolean> => {
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('Failed to save token:', err.message || err.error || `HTTP ${response.status}`);
        return false;
      }
      const savedToken = await response.json();
      const label = token.isNewPatient ? 'New patient' : 'Returning patient';
      const notifText = `${label} ${token.patient.name} checked in — ${token.token} for ${token.doctor?.name || 'Doctor'}`;
      await addNotification(notifText, 'info');
      setTokens((prev) => [...prev, {
        ...token,
        issuedAt: savedToken.issued_at
      }]);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addDoctor = (doctor: Doctor) => {
    setDoctors((prev) => [...prev, doctor]);
  };

  const updateTokenStatus = async (tokenNumber: string, status: Token['status']) => {
    const calledAt = status === 'in-consultation' ? new Date().toISOString() : undefined;
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, calledAt })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((token) =>
            token.token === tokenNumber ? { ...token, status, calledAt: status === 'in-consultation' ? calledAt : token.calledAt } : token
          )
        );
        if (status === 'in-consultation') {
          setCurrentToken(tokenNumber);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateDoctorStatus = async (doctorId: string, status: Doctor['status']) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.id === doctorId ? { ...doc, status } : doc
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markTokenUrgent = async (tokenNumber: string) => {
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urgent: true })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((token) =>
            token.token === tokenNumber ? { ...token, urgent: true } : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addPrescription = async (tokenNumber: string, medicines: Medicine[]) => {
    const billingAmount = medicines.reduce((acc, m) => acc + 150, 0);
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescription: medicines,
          prescriptionStatus: 'pending',
          billingStatus: 'pending',
          billingAmount
        })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((token) =>
            token.token === tokenNumber
              ? {
                  ...token,
                  prescription: medicines,
                  prescriptionStatus: 'pending',
                  billingStatus: 'pending',
                  billingAmount,
                }
              : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const dispensePrescription = async (tokenNumber: string, updatedMedicines: Medicine[], amount: number) => {
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescription: updatedMedicines,
          prescriptionStatus: 'dispensed',
          billingStatus: 'paid',
          billingAmount: amount
        })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((token) =>
            token.token === tokenNumber
              ? {
                  ...token,
                  prescription: updatedMedicines,
                  prescriptionStatus: 'dispensed',
                  billingStatus: 'paid',
                  billingAmount: amount,
                }
              : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const settleBilling = async (
    tokenNumber: string,
    consultationPaid: boolean,
    prescriptionPaid: boolean,
    labPaid: boolean,
    amount: number,
    paymentMethod?: 'upi' | 'cash' | 'card'
  ) => {
    const token = tokens.find(t => t.token === tokenNumber);
    if (!token) return;

    const prescriptionStatus = prescriptionPaid ? 'dispensed' : token.prescriptionStatus;
    const isPaid = (consultationPaid && (!token.prescription || token.prescription.length === 0 || prescriptionPaid) && (!token.labTests || token.labTests.length === 0 || labPaid));
    const billingStatus = isPaid ? 'paid' : 'pending';

    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationPaid,
          prescriptionPaid,
          labPaid,
          prescriptionStatus,
          billingStatus,
          billingAmount: amount,
          paymentMethod
        })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((token) =>
            token.token === tokenNumber
              ? {
                  ...token,
                  consultationPaid,
                  prescriptionPaid,
                  labPaid,
                  prescriptionStatus,
                  billingStatus,
                  billingAmount: amount,
                  paymentMethod: paymentMethod || token.paymentMethod,
                }
              : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const requestLabTests = async (tokenNumber: string, tests: LabTestRequest[]) => {
    const labRequestedAt = new Date().toISOString();
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labTests: tests,
          labStatus: 'pending',
          labRequestedAt
        })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((token) =>
            token.token === tokenNumber
              ? {
                  ...token,
                  labTests: tests,
                  labStatus: 'pending',
                  labRequestedAt: token.labRequestedAt || labRequestedAt,
                  labCompletedAt: undefined,
                  labReportNotes: undefined,
                }
              : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeLabRequest = async (tokenNumber: string, reportNotes: string) => {
    const token = tokens.find(t => t.token === tokenNumber);
    if (!token) return;
    const completedAt = new Date().toISOString();
    const labTests = (token.labTests || []).map(t => ({
      ...t,
      status: 'completed' as const,
      completedAt,
    }));

    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labStatus: 'completed',
          labCompletedAt: completedAt,
          labReportNotes: reportNotes,
          labTests
        })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((token) =>
            token.token === tokenNumber
              ? {
                  ...token,
                  labStatus: 'completed',
                  labCompletedAt: completedAt,
                  labReportNotes: reportNotes,
                  labTests,
                }
              : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateLabTest = async (tokenNumber: string, testName: string) => {
    const token = tokens.find(t => t.token === tokenNumber);
    if (!token) return;
    const now = new Date().toISOString();
    const updatedTests = (token.labTests || []).map(t =>
      t.name === testName ? { ...t, status: 'completed' as const, completedAt: now } : t
    );
    const allDone = updatedTests.every(t => t.status === 'completed');

    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labTests: updatedTests,
          labStatus: allDone ? 'completed' : 'pending',
          labCompletedAt: allDone ? now : undefined,
        })
      });
      if (response.ok) {
        setTokens((prev) =>
          prev.map((t) => {
            if (t.token !== tokenNumber) return t;
            return {
              ...t,
              labTests: updatedTests,
              labStatus: allDone ? 'completed' : 'pending',
              labCompletedAt: allDone ? now : undefined,
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNotification = async (text: string, type: Notification['type'] = 'info') => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type })
      });
      if (response.ok) {
        const notif = await response.json();
        setNotifications((prev) => [notif, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', { method: 'DELETE' });
      if (response.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read', { method: 'POST' });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const callToken = async (tokenNumber: string) => {
    const calledAt = new Date().toISOString();
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calledAt, smsSentAt: calledAt })
      });
      if (response.ok) {
        setTokens(prev =>
          prev.map(token =>
            token.token === tokenNumber
              ? { ...token, calledAt, smsSentAt: calledAt }
              : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendSMS = async (tokenNumber: string) => {
    const smsSentAt = new Date().toISOString();
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsSentAt })
      });
      if (response.ok) {
        setTokens(prev =>
          prev.map(token =>
            token.token === tokenNumber ? { ...token, smsSentAt } : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveVitals = async (tokenNumber: string, vitals: { bp: string; temp: string; pulse: string; weight: string }) => {
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vitals })
      });
      if (response.ok) {
        setTokens(prev =>
          prev.map(token =>
            token.token === tokenNumber ? { ...token, vitals } : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendToPharmacy = async (tokenNumber: string, medicines: Medicine[]) => {
    const pharmacySentAt = new Date().toISOString();
    try {
      const response = await fetch(`/api/tokens/${tokenNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescription: medicines,
          prescriptionStatus: 'pending',
          pharmacySentAt
        })
      });
      if (response.ok) {
        setTokens(prev =>
          prev.map(token =>
            token.token === tokenNumber
              ? { ...token, prescription: medicines, prescriptionStatus: 'pending', pharmacySentAt }
              : token
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const savePrescriptionTemplate = async (name: string, medicines: Medicine[]) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, medicines })
      });
      if (response.ok) {
        const saved = await response.json();
        setPrescriptionTemplates(prev => [{
          id: saved.id,
          name: saved.name,
          medicines: typeof saved.medicines === 'string' ? JSON.parse(saved.medicines) : saved.medicines
        }, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePrescriptionTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setPrescriptionTemplates(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appt)
      });
      if (response.ok) {
        const saved = await response.json();
        setAppointments(prev => [...prev, {
          ...appt,
          id: saved.id,
          createdAt: saved.created_at
        }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startSession = () => {
    setSessionStartTime(new Date());
  };

  const endSession = () => {
    setTokens(prev =>
      prev.map(t => t.status === 'in-consultation' ? { ...t, status: 'waiting', calledAt: undefined } : t)
    );
    setSessionStartTime(null);
    setCurrentToken(null);
  };

  const callNextToken = (doctorId: string) => {
    const nextToken = tokens.find(
      (token) => token.doctor?.id === doctorId && token.status === 'waiting'
    );
    if (nextToken) {
      updateTokenStatus(nextToken.token, 'in-consultation');
    }
  };

  return (
    <AppContext.Provider
      value={{
        tokens,
        doctors,
        sessionStartTime,
        currentToken,
        notifications,
        prescriptionTemplates,
        appointments,
        addToken,
        addDoctor,
        updateTokenStatus,
        updateDoctorStatus,
        markTokenUrgent,
        startSession,
        endSession,
        callNextToken,
        callToken,
        sendSMS,
        addPrescription,
        dispensePrescription,
        settleBilling,
        requestLabTests,
        completeLabRequest,
        updateLabTest,
        addNotification,
        clearNotifications,
        markNotificationsAsRead,
        saveVitals,
        sendToPharmacy,
        savePrescriptionTemplate,
        deletePrescriptionTemplate,
        addAppointment,
        updateAppointmentStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
