-- Drop existing tables if they exist (clean setup)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS prescription_templates;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;

-- Users table (Doctors, Receptionists, Admins, Pharmacists, Lab technicians)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    specialty VARCHAR(100),
    avg_wait INTEGER DEFAULT 15,
    status VARCHAR(50) DEFAULT 'on-duty'
);

-- Patients table
CREATE TABLE patients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(20) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    selected_conditions TEXT[] DEFAULT '{}'::TEXT[],
    address TEXT,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    patient_mobile VARCHAR(20) NOT NULL,
    patient_age VARCHAR(20),
    patient_gender VARCHAR(20),
    doctor_id VARCHAR(50) REFERENCES users(id),
    doctor_name VARCHAR(100) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens table (Live Consultation Queue)
CREATE TABLE tokens (
    id VARCHAR(50) PRIMARY KEY,
    token_number VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) REFERENCES patients(id),
    patient_name VARCHAR(100) NOT NULL,
    patient_age VARCHAR(20) NOT NULL,
    patient_gender VARCHAR(20) NOT NULL,
    patient_mobile VARCHAR(20) NOT NULL,
    patient_blood_group VARCHAR(10) NOT NULL,
    patient_selected_conditions TEXT[] DEFAULT '{}'::TEXT[],
    patient_address TEXT,
    doctor_id VARCHAR(50) REFERENCES users(id),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'waiting',
    called_at TIMESTAMP,
    sms_sent_at TIMESTAMP,
    urgent BOOLEAN DEFAULT FALSE,
    prescription JSONB,
    prescription_status VARCHAR(20) DEFAULT 'pending',
    billing_status VARCHAR(20) DEFAULT 'pending',
    billing_amount NUMERIC DEFAULT 0,
    vitals JSONB,
    pharmacy_sent_at TIMESTAMP,
    lab_tests JSONB,
    lab_status VARCHAR(20),
    lab_requested_at TIMESTAMP,
    lab_completed_at TIMESTAMP,
    lab_report_notes TEXT,
    is_new_patient BOOLEAN DEFAULT FALSE,
    consultation_paid BOOLEAN DEFAULT FALSE,
    prescription_paid BOOLEAN DEFAULT FALSE,
    lab_paid BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(20)
);

-- Prescription Templates table
CREATE TABLE prescription_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    medicines JSONB NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    text TEXT NOT NULL,
    time VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
