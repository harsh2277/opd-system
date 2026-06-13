import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { hashPassword } from '../auth';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables!');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

/**
 * Idempotent user seed — SAFE to run against a live database.
 * Unlike db:init, this does NOT drop or recreate any tables; it only
 * upserts the standard staff/doctor accounts. Run with:
 *   npm run db:seed
 */
async function run() {
  const usersToSeed = [
    { id: 'RC001', email: 'harsh@gmail.com', name: 'Harsh Reception', role: 'Receptionist', password: 'harsh123', specialty: null },
    { id: 'ADM001', email: 'admin@gmail.com', name: 'Prem Admin', role: 'Administrator', password: 'admin123', specialty: null },
    { id: 'PH003', email: 'pharmacy@gmail.com', name: 'Pharmacy Staff', role: 'Pharmacy Staff', password: 'pharmacy123', specialty: null },
    { id: 'LB001', email: 'lab@gmail.com', name: 'Lab Staff', role: 'Chief Pathologist', password: 'lab123', specialty: null },
    { id: 'D001', email: 'sharma@gmail.com', name: 'Dr. Sharma', role: 'Doctor', password: 'sharma123', specialty: 'General Physician' },
    { id: 'D002', email: 'patel@gmail.com', name: 'Dr. Patel', role: 'Doctor', password: 'patel123', specialty: 'Cardiologist' },
    { id: 'D003', email: 'kumar@gmail.com', name: 'Dr. Kumar', role: 'Doctor', password: 'kumar123', specialty: 'Pediatrician' },
    { id: 'D004', email: 'singh@gmail.com', name: 'Dr. Singh', role: 'Doctor', password: 'singh123', specialty: 'Dermatologist' },
    { id: 'D005', email: 'mehta@gmail.com', name: 'Dr. Mehta', role: 'Doctor', password: 'mehta123', specialty: 'Orthopedic' },
    { id: 'D006', email: 'rao@gmail.com', name: 'Dr. Rao', role: 'Doctor', password: 'rao123', specialty: 'ENT Specialist' },
  ];

  console.log('Seeding users (idempotent, non-destructive)...');
  for (const u of usersToSeed) {
    const { hash, salt } = hashPassword(u.password);
    await sql`
      INSERT INTO users (id, email, password_hash, salt, name, role, specialty, avg_wait, status)
      VALUES (${u.id}, ${u.email}, ${hash}, ${salt}, ${u.name}, ${u.role}, ${u.specialty}, 15, 'on-duty')
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role, specialty = EXCLUDED.specialty;
    `;
    console.log(`  ✓ ${u.id} — ${u.name} (${u.role})`);
  }
  console.log('User seeding complete.');
}

run().catch((err) => {
  console.error('Error during user seeding:', err);
  process.exit(1);
});
