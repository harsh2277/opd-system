import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { verifyPassword, generateToken, verifyToken } from './auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

const sql = neon(process.env.DATABASE_URL!);

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    res.json({
      status: 'OK',
      message: 'Server is running and connected to Neon Database',
      dbTime: result[0].current_time
    });
  } catch (error) {
    console.error('Database query error during healthcheck:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to connect to Neon database' });
  }
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email.trim().toLowerCase()}`;
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = verifyPassword(password, user.password_hash, user.salt);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE id = ${payload.id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      specialty: user.specialty,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// DOCTORS ENDPOINTS
// ==========================================

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await sql`SELECT id, name, specialty, status FROM users WHERE role = 'Doctor'`;
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/doctors/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await sql`
      UPDATE users 
      SET status = ${status} 
      WHERE id = ${id} AND role = 'Doctor'
      RETURNING id, name, specialty, status
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// PATIENTS ENDPOINTS
// ==========================================

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await sql`SELECT * FROM patients ORDER BY name ASC`;
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/patients', async (req, res) => {
  const { id, name, age, gender, mobile, bloodGroup, selectedConditions, address } = req.body;
  const patientId = id || `PAT-${Date.now()}`;
  try {
    const formatPgArray = (arr: string[]) => {
      if (!arr || !Array.isArray(arr)) return '{}';
      return `{${arr.map(v => v.replace(/["\\',{}]/g, '')).join(',')}}`;
    };
    const pConditions = formatPgArray(selectedConditions);

    const result = await sql`
      INSERT INTO patients (id, name, age, gender, mobile, blood_group, selected_conditions, address, last_visit)
      VALUES (${patientId}, ${name}, ${age}, ${gender}, ${mobile}, ${bloodGroup}, ${pConditions}, ${address || null}, NOW())
      ON CONFLICT (id) DO UPDATE 
      SET name = EXCLUDED.name, age = EXCLUDED.age, gender = EXCLUDED.gender, mobile = EXCLUDED.mobile, blood_group = EXCLUDED.blood_group, last_visit = NOW()
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Patient insert/update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// APPOINTMENTS ENDPOINTS
// ==========================================

app.get('/api/appointments', async (req, res) => {
  try {
    const appts = await sql`SELECT * FROM appointments ORDER BY date ASC, time ASC`;
    res.json(appts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { patientName, patientMobile, patientAge, patientGender, doctorId, doctorName, date, time, notes } = req.body;
  const id = `appt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  try {
    const result = await sql`
      INSERT INTO appointments (id, patient_name, patient_mobile, patient_age, patient_gender, doctor_id, doctor_name, date, time, notes, status, created_at)
      VALUES (${id}, ${patientName}, ${patientMobile}, ${patientAge}, ${patientGender}, ${doctorId}, ${doctorName}, ${date}, ${time}, ${notes || null}, 'scheduled', NOW())
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/api/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await sql`
      UPDATE appointments 
      SET status = ${status} 
      WHERE id = ${id} 
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// TOKENS (OPD QUEUE) ENDPOINTS
// ==========================================

app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await sql`SELECT * FROM tokens ORDER BY issued_at ASC`;
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/tokens', async (req, res) => {
  const {
    id, token, tokenNumber, patient, doctor, urgent, vitals, isNewPatient,
    billingStatus, billingAmount, consultationPaid, paymentMethod
  } = req.body;

  const actualTokenNumber = tokenNumber || token;
  const tokenId = id || `TOK-${Date.now()}`;

  try {
    // Helper to format JS array to standard PG array format e.g. '{val1,val2}'
    const formatPgArray = (arr: string[]) => {
      if (!arr || !Array.isArray(arr)) return '{}';
      return `{${arr.map(v => v.replace(/["\\',{}]/g, '')).join(',')}}`;
    };

    // 1. Ensure Patient exists or is upserted
    let patientId = patient?.id;
    if (!patientId) {
      patientId = `PAT-${Date.now()}`;
    }
    
    const pName = patient?.name || 'Unknown Patient';
    const pAge = patient?.age || '0';
    const pGender = patient?.gender || 'Other';
    const pMobile = patient?.mobile || '';
    const pBloodGroup = patient?.bloodGroup || 'Not Known';
    const pConditions = formatPgArray(patient?.selectedConditions);
    const pAddress = patient?.address || null;

    await sql`
      INSERT INTO patients (id, name, age, gender, mobile, blood_group, selected_conditions, address, last_visit)
      VALUES (${patientId}, ${pName}, ${pAge}, ${pGender}, ${pMobile}, ${pBloodGroup}, ${pConditions}, ${pAddress}, NOW())
      ON CONFLICT (id) DO UPDATE 
      SET last_visit = NOW();
    `;

    // 2. Insert Token
    const result = await sql`
      INSERT INTO tokens (
        id, token_number, patient_id, patient_name, patient_age, patient_gender, patient_mobile, patient_blood_group, patient_selected_conditions, patient_address,
        doctor_id, status, urgent, vitals, is_new_patient, issued_at,
        billing_status, billing_amount, consultation_paid, payment_method
      )
      VALUES (
        ${tokenId}, ${actualTokenNumber}, ${patientId}, ${pName}, ${pAge}, ${pGender}, ${pMobile}, ${pBloodGroup}, ${pConditions}, ${pAddress},
        ${doctor?.id || null}, 'waiting', ${urgent || false}, ${vitals ? JSON.stringify(vitals) : null}, ${isNewPatient || false}, NOW(),
        ${billingStatus || 'pending'}, ${billingAmount || 0}, ${consultationPaid || false}, ${paymentMethod || null}
      )
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error('Token create error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message || String(error) });
  }
});

app.patch('/api/tokens/:tokenNumber', async (req, res) => {
  const { tokenNumber } = req.params;
  const updates = req.body;

  try {
    // Dynamically build patch updates if needed, or update key fields
    const current = await sql`SELECT * FROM tokens WHERE token_number = ${tokenNumber}`;
    if (current.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const t = current[0];

    const status = updates.status !== undefined ? updates.status : t.status;
    const called_at = updates.calledAt !== undefined ? (updates.calledAt ? new Date(updates.calledAt) : null) : t.called_at;
    const sms_sent_at = updates.smsSentAt !== undefined ? (updates.smsSentAt ? new Date(updates.smsSentAt) : null) : t.sms_sent_at;
    const urgent = updates.urgent !== undefined ? updates.urgent : t.urgent;
    const prescription = updates.prescription !== undefined ? JSON.stringify(updates.prescription) : t.prescription;
    const prescription_status = updates.prescriptionStatus !== undefined ? updates.prescriptionStatus : t.prescription_status;
    const billing_status = updates.billingStatus !== undefined ? updates.billingStatus : t.billing_status;
    const billing_amount = updates.billingAmount !== undefined ? updates.billingAmount : t.billing_amount;
    const vitals = updates.vitals !== undefined ? JSON.stringify(updates.vitals) : t.vitals;
    const pharmacy_sent_at = updates.pharmacySentAt !== undefined ? (updates.pharmacySentAt ? new Date(updates.pharmacySentAt) : null) : t.pharmacy_sent_at;
    const lab_tests = updates.labTests !== undefined ? JSON.stringify(updates.labTests) : t.lab_tests;
    const lab_status = updates.labStatus !== undefined ? updates.labStatus : t.lab_status;
    const lab_requested_at = updates.labRequestedAt !== undefined ? (updates.labRequestedAt ? new Date(updates.labRequestedAt) : null) : t.lab_requested_at;
    const lab_completed_at = updates.labCompletedAt !== undefined ? (updates.labCompletedAt ? new Date(updates.labCompletedAt) : null) : t.lab_completed_at;
    const lab_report_notes = updates.labReportNotes !== undefined ? updates.labReportNotes : t.lab_report_notes;
    const consultation_paid = updates.consultationPaid !== undefined ? updates.consultationPaid : t.consultation_paid;
    const prescription_paid = updates.prescriptionPaid !== undefined ? updates.prescriptionPaid : t.prescription_paid;
    const lab_paid = updates.labPaid !== undefined ? updates.labPaid : t.lab_paid;
    const payment_method = updates.paymentMethod !== undefined ? updates.paymentMethod : t.payment_method;

    const result = await sql`
      UPDATE tokens
      SET 
        status = ${status},
        called_at = ${called_at},
        sms_sent_at = ${sms_sent_at},
        urgent = ${urgent},
        prescription = ${prescription},
        prescription_status = ${prescription_status},
        billing_status = ${billing_status},
        billing_amount = ${billing_amount},
        vitals = ${vitals},
        pharmacy_sent_at = ${pharmacy_sent_at},
        lab_tests = ${lab_tests},
        lab_status = ${lab_status},
        lab_requested_at = ${lab_requested_at},
        lab_completed_at = ${lab_completed_at},
        lab_report_notes = ${lab_report_notes},
        consultation_paid = ${consultation_paid},
        prescription_paid = ${prescription_paid},
        lab_paid = ${lab_paid},
        payment_method = ${payment_method}
      WHERE token_number = ${tokenNumber}
      RETURNING *
    `;

    res.json(result[0]);
  } catch (error) {
    console.error('Token patch error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// PRESCRIPTION TEMPLATES ENDPOINTS
// ==========================================

app.get('/api/templates', async (req, res) => {
  try {
    const templates = await sql`SELECT * FROM prescription_templates`;
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/templates', async (req, res) => {
  const { name, medicines } = req.body;
  const id = `tpl-${Date.now()}`;
  try {
    const result = await sql`
      INSERT INTO prescription_templates (id, name, medicines)
      VALUES (${id}, ${name}, ${JSON.stringify(medicines)})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM prescription_templates WHERE id = ${id}`;
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// NOTIFICATIONS ENDPOINTS
// ==========================================

app.get('/api/notifications', async (req, res) => {
  try {
    const notifs = await sql`SELECT * FROM notifications ORDER BY created_at DESC`;
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/notifications', async (req, res) => {
  const { text, type } = req.body;
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  try {
    const result = await sql`
      INSERT INTO notifications (id, text, time, type, unread, created_at)
      VALUES (${id}, ${text}, ${time}, ${type || 'info'}, true, NOW())
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/notifications/read', async (req, res) => {
  try {
    await sql`UPDATE notifications SET unread = false`;
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    await sql`DELETE FROM notifications`;
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
