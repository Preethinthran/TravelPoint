import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// --- START SILENCE BLOCK ---
// We temporarily turn off the console to stop the "[dotenv] injecting..." message
const originalWrite = process.stdout.write;
// @ts-ignore
process.stdout.write = () => true; 

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Restore the console so the rest of the app works
process.stdout.write = originalWrite;
// --- END SILENCE BLOCK ---
// Create a POOL, not a single connection
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max 10 concurrent connections
  queueLimit: 0
});

// Helper function to test connection
export async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL Pool!');
    connection.release(); // Important: Release it back to the pool!
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testDbConnection().then(() => {
        // Optional: Close pool to let script exit
        // pool.end(); 
    });
}