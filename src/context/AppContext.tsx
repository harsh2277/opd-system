import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface LabTestRequest {
  name: string;
  notes?: string;
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
  id: string; // Unique identifier for React keys
  token: string;
  patient: Patient;
  doctor: Doctor;
  issuedAt: string;
  status: 'waiting' | 'in-consultation' | 'done' | 'skipped';
  urgent: boolean;
  prescription?: Medicine[];
  prescriptionStatus?: 'pending' | 'dispensed';
  billingStatus?: 'pending' | 'paid';
  billingAmount?: number;
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
  addToken: (token: Token) => void;
  addDoctor: (doctor: Doctor) => void;
  updateTokenStatus: (tokenNumber: string, status: Token['status']) => void;
  updateDoctorStatus: (doctorId: string, status: Doctor['status']) => void;
  markTokenUrgent: (tokenNumber: string) => void;
  startSession: () => void;
  endSession: () => void;
  callNextToken: (doctorId: string) => void;
  addPrescription: (tokenNumber: string, medicines: Medicine[]) => void;
  dispensePrescription: (tokenNumber: string, updatedMedicines: Medicine[], amount: number) => void;
  settleBilling: (tokenNumber: string, consultationPaid: boolean, prescriptionPaid: boolean, labPaid: boolean, amount: number, paymentMethod?: 'upi' | 'cash' | 'card') => void;
  requestLabTests: (tokenNumber: string, tests: LabTestRequest[]) => void;
  completeLabRequest: (tokenNumber: string, reportNotes: string) => void;
  addNotification: (text: string, type?: Notification['type']) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
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
  // Load from localStorage on mount
  const [tokens, setTokens] = useState<Token[]>(() => {
    const saved = localStorage.getItem('opd-tokens');
    return saved ? JSON.parse(saved) : [];
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('opd-doctors');
    return saved ? JSON.parse(saved) : initialDoctors;
  });

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('opd-session-start');
    return saved ? new Date(saved) : null;
  });

  const [currentToken, setCurrentToken] = useState<string | null>(() => {
    return localStorage.getItem('opd-current-token');
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('opd-notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('opd-tokens', JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('opd-doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('opd-notifications', JSON.stringify(notifications));
  }, [notifications]);

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

  // Listen for storage changes from other windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'opd-tokens' && e.newValue) {
        setTokens(JSON.parse(e.newValue));
      } else if (e.key === 'opd-doctors' && e.newValue) {
        setDoctors(JSON.parse(e.newValue));
      } else if (e.key === 'opd-notifications' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      } else if (e.key === 'opd-current-token') {
        setCurrentToken(e.newValue);
      } else if (e.key === 'opd-session-start' && e.newValue) {
        setSessionStartTime(new Date(e.newValue));
      } else if (e.key === 'opd-session-start' && !e.newValue) {
        setSessionStartTime(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update doctor queue counts when tokens change
  useEffect(() => {
    const updatedDoctors = doctors.map((doctor) => {
      const waitingCount = tokens.filter(
        (token) => token.doctor.id === doctor.id && token.status === 'waiting'
      ).length;
      return { ...doctor, queue: waitingCount };
    });
    setDoctors(updatedDoctors);
  }, [tokens]);

  const addToken = (token: Token) => {
    setTokens((prev) => [...prev, token]);
    const label = token.isNewPatient ? 'New patient' : 'Returning patient';
    setNotifications((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        text: `${label} ${token.patient.name} checked in — ${token.token} for ${token.doctor.name}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'info' as const,
        unread: true,
      },
      ...prev,
    ]);
  };

  const addDoctor = (doctor: Doctor) => {
    setDoctors((prev) => [...prev, doctor]);
  };

  const updateTokenStatus = (tokenNumber: string, status: Token['status']) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.token === tokenNumber ? { ...token, status } : token
      )
    );
    if (status === 'in-consultation') {
      setCurrentToken(tokenNumber);
    }
  };

  const updateDoctorStatus = (doctorId: string, status: Doctor['status']) => {
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === doctorId ? { ...doc, status } : doc
      )
    );
  };

  const markTokenUrgent = (tokenNumber: string) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.token === tokenNumber ? { ...token, urgent: true } : token
      )
    );
  };

  const addPrescription = (tokenNumber: string, medicines: Medicine[]) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.token === tokenNumber
          ? {
              ...token,
              prescription: medicines,
              prescriptionStatus: 'pending',
              billingStatus: 'pending',
              billingAmount: medicines.reduce((acc, m) => acc + 150, 0), // Base estimate
            }
          : token
      )
    );
  };

  const dispensePrescription = (tokenNumber: string, updatedMedicines: Medicine[], amount: number) => {
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
  };

  const settleBilling = (
    tokenNumber: string,
    consultationPaid: boolean,
    prescriptionPaid: boolean,
    labPaid: boolean,
    amount: number,
    paymentMethod?: 'upi' | 'cash' | 'card'
  ) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.token === tokenNumber
          ? {
              ...token,
              consultationPaid,
              prescriptionPaid,
              labPaid,
              prescriptionStatus: prescriptionPaid ? 'dispensed' : token.prescriptionStatus,
              billingStatus: (consultationPaid && (!token.prescription || token.prescription.length === 0 || prescriptionPaid) && (!token.labTests || token.labTests.length === 0 || labPaid)) ? 'paid' : 'pending',
              billingAmount: amount,
              paymentMethod: paymentMethod || token.paymentMethod,
            }
          : token
      )
    );
  };

  const requestLabTests = (tokenNumber: string, tests: LabTestRequest[]) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.token === tokenNumber
          ? {
              ...token,
              labTests: tests,
              labStatus: 'pending',
              labRequestedAt: token.labRequestedAt || new Date().toISOString(),
              labCompletedAt: undefined,
              labReportNotes: undefined,
            }
          : token
      )
    );
  };

  const completeLabRequest = (tokenNumber: string, reportNotes: string) => {
    setTokens((prev) =>
      prev.map((token) =>
        token.token === tokenNumber
          ? {
              ...token,
              labStatus: 'completed',
              labCompletedAt: new Date().toISOString(),
              labReportNotes: reportNotes,
            }
          : token
      )
    );
  };

  const addNotification = (text: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type,
      unread: true,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Clean up old tokens without IDs on load
  useEffect(() => {
    const cleanTokens = tokens.map((token) => {
      if (!token.id) {
        return { ...token, id: `${token.token}-${Date.now()}-${Math.random()}` };
      }
      return token;
    });
    if (cleanTokens.some((t, i) => t.id !== tokens[i]?.id)) {
      setTokens(cleanTokens);
    }
  }, []);

  const startSession = () => {
    setSessionStartTime(new Date());
  };

  const endSession = () => {
    setSessionStartTime(null);
    setCurrentToken(null);
  };

  const callNextToken = (doctorId: string) => {
    const nextToken = tokens.find(
      (token) => token.doctor.id === doctorId && token.status === 'waiting'
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
      addToken,
      addDoctor,
      updateTokenStatus,
        updateDoctorStatus,
        markTokenUrgent,
        startSession,
        endSession,
        callNextToken,
        addPrescription,
        dispensePrescription,
        settleBilling,
        requestLabTests,
        completeLabRequest,
        addNotification,
        clearNotifications,
        markNotificationsAsRead,
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
