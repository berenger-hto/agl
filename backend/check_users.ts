import { pool } from './src/config/pool';

async function listEmployees() {
    try {
        const [rows] = await pool.execute('SELECT * FROM EMPLOYES');
        console.log('Employees:', rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

listEmployees();
