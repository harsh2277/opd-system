import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Neon Client
const sql = neon(process.env.DATABASE_URL!);

app.use(cors());
app.use(express.json());

// API health endpoint and database check
app.get('/api/health', async (req, res) => {
  try {
    // Quick test query to ensure connection is working
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
