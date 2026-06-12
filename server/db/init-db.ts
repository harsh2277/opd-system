import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables!');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  try {
    console.log('Reading schema.sql...');
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Initializing database tables in Neon...');
    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      await sql(query);
    }
    console.log('Tables created successfully!');

    console.log('Seeding initial users...');

    // Prepare credentials list
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
      { id: 'D006', email: 'rao@gmail.com', name: 'Dr. Rao', role: 'Doctor', password: 'rao123', specialty: 'ENT Specialist' }
    ];

    for (const u of usersToSeed) {
      const { hash, salt } = hashPassword(u.password);
      await sql`
        INSERT INTO users (id, email, password_hash, salt, name, role, specialty, avg_wait, status)
        VALUES (${u.id}, ${u.email}, ${hash}, ${salt}, ${u.name}, ${u.role}, ${u.specialty}, 15, 'on-duty')
        ON CONFLICT (id) DO UPDATE 
        SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, salt = EXCLUDED.salt, name = EXCLUDED.name, role = EXCLUDED.role;
      `;
      console.log(`Seeded user: ${u.email} (${u.role})`);
    }

    console.log('Database initialization and seeding completed successfully!');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

run();
