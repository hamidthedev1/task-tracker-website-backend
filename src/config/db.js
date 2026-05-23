import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Handle unexpected errors
pool.on('error', (err)=>{
  console.err('Unexpected Postgres client error', err);
});

// Query helper
export async function query(sql, params) {
  return pool.query(sql, params);
}

// Test connection
export async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅ Database connected');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed', err);
    return false;
  } finally {
    client.release();
  }
}

export default { query, testConnection, pool };