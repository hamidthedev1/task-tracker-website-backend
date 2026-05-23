import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';

// Import custom database connection module
import db from './config/db.js';
const { testConnection, pool } = db;

// Import API sub-routers
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
  
// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Route Registrations
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack); // Log the error stack trace for debugging
  
  const status = err.statusCode || 500; 
  const message = err.message || 'Internal Server Error'; 
  
  res.status(status).json({
    success: false,
    status: status,
    message: message,
    // Only include stack trace in development mode for system security
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Seed function to create an admin user if none exists
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tasktracker.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminRole = process.env.ADMIN_ROLE || 'ADMIN';

    // Verify if an administrator account already exists
    const { rows } = await pool.query('SELECT * FROM "users" WHERE email = $1', [adminEmail]);

    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        'INSERT INTO "users" (email, password_hash, role) VALUES ($1, $2, $3)',
        [adminEmail, hashedPassword, adminRole]
      );
      console.log(`✨ Admin user seeded successfully: ${adminEmail}`);
    } else {
      console.log('ℹ️ Admin seeding skipped: Admin account already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

// Application Boot-up Lifecycle Orchestrator
async function startServer() {
  try {
    // 1. Test database connection before everything else
    await testConnection();

    // 2. Safe execution point: Seed admin metadata while server is offline
    await seedAdmin();
    
    // 3. Open network sockets to begin listening for incoming client requests
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });    
  } catch (error) {
    console.error('❌ Failed to start server', error);
  }
}

// Fire up the engine!
startServer();

export default app;