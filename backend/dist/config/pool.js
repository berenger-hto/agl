import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
export const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'gest_pme',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
export async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
