import { Context } from 'hono';
import { pool } from '../config/pool.js';
import { RowDataPacket } from 'mysql2';

export class EmployeeController {
    static async getAll(c: Context) {
        try {
            // Fetch all employees with their roles if possible
            // This is a simplified query. In a real scenario, we'd LEFT JOIN with CAISSIERS, AGENTS, etc.
            // to determine the role.

            const query = `
            SELECT e.*, 
            CASE 
                WHEN c.matricule_employe IS NOT NULL THEN 'Caissier'
                WHEN a.matricule_employe IS NOT NULL THEN 'Agent Production'
                WHEN adm.matricule_employe IS NOT NULL THEN adm.poste_administratif
                ELSE 'Employe'
            END as poste
            FROM EMPLOYES e
            LEFT JOIN CAISSIERS c ON e.matricule_employe = c.matricule_employe
            LEFT JOIN AGENTS_PRODUCTIONS a ON e.matricule_employe = a.matricule_employe
            LEFT JOIN ADMINISTRATIFS adm ON e.matricule_employe = adm.matricule_employe
        `;

            const [rows] = await pool.execute<RowDataPacket[]>(query);
            return c.json(rows);
        } catch (error) {
            console.error('Error fetching employees:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
