import { Context } from 'hono';
import { pool } from '../config/pool.js';
import { RowDataPacket } from 'mysql2';
import { EmployeeModel } from '../models/Employee.model.js';

export class EmployeeController {
    static async getAll(c: Context) {
        try {
            const format = c.req.query('format');
            if (format === 'tree') {
                const tree = await EmployeeModel.getHierarchy();
                return c.json(tree);
            }

            const employees = await EmployeeModel.getAll();
            return c.json(employees);
        } catch (error) {
            console.error('Error fetching employees:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }

    static async create(c: Context) {
        try {
            const body = await c.req.json();
            if (!body.nom_employe || !body.prenom_employe || !body.email_employe || !body.role) {
                return c.json({ error: 'Missing required fields' }, 400);
            }

            const insertId = await EmployeeModel.create(body);
            return c.json({ success: true, id: insertId }, 201);
        } catch (error) {
            console.error('Error creating employee:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
    static async delete(c: Context) {
        try {
            const id = Number(c.req.param('id'));
            if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

            await EmployeeModel.delete(id);
            return c.json({ success: true });
        } catch (error) {
            console.error('Error deleting employee:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
