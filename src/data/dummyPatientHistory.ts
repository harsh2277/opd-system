// Dummy patient history data
export const dummyPatientHistories = [
  {
    mobile: '9876543210',
    patientName: 'Rajesh Kumar',
    history: [
      {
        id: '1',
        date: '2026-05-15T10:30:00Z',
        doctor: 'Dr. Sharma',
        specialty: 'General Physician',
        diagnosis: 'Common Cold with fever',
        prescription: 'Paracetamol 500mg (3 times daily), Vitamin C tablets, Rest for 3 days',
        notes: 'Patient presented with mild fever (99.5°F), runny nose, and body ache. Advised warm water consumption and steam inhalation.',
        vitals: { bp: '120/80', temp: '99.5°F', pulse: '78', weight: '72kg' },
      },
      {
        id: '2',
        date: '2026-04-02T14:15:00Z',
        doctor: 'Dr. Patel',
        specialty: 'Cardiologist',
        diagnosis: 'Annual cardiac checkup - Normal',
        prescription: 'Continue with Atorvastatin 10mg (once daily)',
        notes: 'ECG and blood pressure readings normal. Cholesterol levels slightly elevated. Advised low-fat diet and regular exercise.',
        vitals: { bp: '118/78', temp: '98.6°F', pulse: '72', weight: '71kg' },
      },
      {
        id: '3',
        date: '2026-02-20T11:00:00Z',
        doctor: 'Dr. Kumar',
        specialty: 'Pediatrician',
        diagnosis: 'Routine health checkup',
        prescription: 'Multivitamin syrup - once daily for 30 days',
        notes: 'Child is healthy and growing well. All developmental milestones met. Vaccination schedule up to date.',
        vitals: { bp: '110/70', temp: '98.4°F', pulse: '85', weight: '70kg' },
      },
    ],
  },
  {
    mobile: '9876543211',
    patientName: 'Priya Patel',
    history: [
      {
        id: '4',
        date: '2026-05-20T09:45:00Z',
        doctor: 'Dr. Singh',
        specialty: 'Dermatologist',
        diagnosis: 'Allergic skin rash',
        prescription: 'Cetirizine 10mg (once daily), Calamine lotion (topical application), Hydrocortisone cream 1%',
        notes: 'Patient has allergic reaction possibly due to new cosmetic product. Advised to discontinue use and avoid known allergens.',
        vitals: { bp: '115/75', temp: '98.6°F', pulse: '74', weight: '58kg' },
      },
      {
        id: '5',
        date: '2026-03-10T16:20:00Z',
        doctor: 'Dr. Patel',
        specialty: 'Cardiologist',
        diagnosis: 'Palpitations - Anxiety related',
        prescription: 'Propranolol 10mg (as needed), Breathing exercises, Stress management counseling',
        notes: 'ECG normal. Heart rate slightly elevated due to anxiety. Recommended relaxation techniques and follow-up if symptoms persist.',
        vitals: { bp: '125/82', temp: '98.4°F', pulse: '92', weight: '58kg' },
      },
    ],
  },
  {
    mobile: '9876543212',
    patientName: 'Amit Singh',
    history: [
      {
        id: '6',
        date: '2026-05-18T13:30:00Z',
        doctor: 'Dr. Kumar',
        specialty: 'Pediatrician',
        diagnosis: 'Asthma - Mild exacerbation',
        prescription: 'Salbutamol inhaler (2 puffs when needed), Montelukast 10mg (once daily at night)',
        notes: 'Patient experienced mild breathing difficulty due to weather change. Peak flow meter reading: 380 L/min. Advised to carry inhaler always.',
        vitals: { bp: '118/76', temp: '98.7°F', pulse: '80', weight: '65kg' },
      },
      {
        id: '7',
        date: '2026-04-25T10:15:00Z',
        doctor: 'Dr. Sharma',
        specialty: 'General Physician',
        diagnosis: 'Gastritis',
        prescription: 'Pantoprazole 40mg (before breakfast), Antacids (after meals), Avoid spicy food',
        notes: 'Patient complained of acidity and burning sensation in stomach. Advised dietary modifications and stress reduction.',
        vitals: { bp: '120/78', temp: '98.6°F', pulse: '76', weight: '64kg' },
      },
      {
        id: '8',
        date: '2026-03-15T15:45:00Z',
        doctor: 'Dr. Rao',
        specialty: 'ENT Specialist',
        diagnosis: 'Tonsillitis',
        prescription: 'Azithromycin 500mg (3 days course), Betadine gargle (3 times daily), Warm saline water gargle',
        notes: 'Patient has inflamed tonsils with white patches. Throat culture sent for testing. Advised soft diet and adequate rest.',
        vitals: { bp: '122/80', temp: '100.2°F', pulse: '84', weight: '64kg' },
      },
    ],
  },
  {
    mobile: '9123456789',
    patientName: 'Sneha Reddy',
    history: [
      {
        id: '9',
        date: '2026-05-22T11:30:00Z',
        doctor: 'Dr. Sharma',
        specialty: 'General Physician',
        diagnosis: 'Migraine headache',
        prescription: 'Sumatriptan 50mg (when needed), Avoid trigger foods, Maintain sleep schedule',
        notes: 'Patient has recurring migraines triggered by stress and lack of sleep. Advised lifestyle modifications and stress management.',
        vitals: { bp: '110/72', temp: '98.6°F', pulse: '70', weight: '55kg' },
      },
    ],
  },
  {
    mobile: '9234567890',
    patientName: 'Arjun Mehta',
    history: [
      {
        id: '10',
        date: '2026-05-19T14:00:00Z',
        doctor: 'Dr. Singh',
        specialty: 'Dermatologist',
        diagnosis: 'Acne vulgaris',
        prescription: 'Clindamycin gel (topical, twice daily), Benzoyl peroxide face wash, Avoid oil-based cosmetics',
        notes: 'Moderate acne on face and upper back. Advised proper skin care routine and follow-up in 4 weeks.',
        vitals: { bp: '118/75', temp: '98.5°F', pulse: '72', weight: '68kg' },
      },
      {
        id: '11',
        date: '2026-04-01T10:45:00Z',
        doctor: 'Dr. Sharma',
        specialty: 'General Physician',
        diagnosis: 'Viral fever',
        prescription: 'Paracetamol 650mg (3 times daily), Plenty of fluids, Rest',
        notes: 'Patient has viral infection with fever (101°F) and body ache. Complete blood count shows elevated WBC. Advised rest and hydration.',
        vitals: { bp: '120/78', temp: '101°F', pulse: '86', weight: '67kg' },
      },
    ],
  },
];

// Function to get patient history by mobile number
export function getPatientHistory(mobile: string) {
  const patientData = dummyPatientHistories.find((p) => p.mobile === mobile);
  return patientData?.history || [];
}

// Function to get all patients with history
export function getAllPatientsWithHistory() {
  return dummyPatientHistories;
}
