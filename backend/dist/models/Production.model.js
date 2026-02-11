import { pool } from '../config/pool.js';
export class ProductionModel {
    static async getAll() {
        const [rows] = await pool.execute('SELECT * FROM PRODUCTIONS ORDER BY date_production DESC');
        return rows;
    }
    static async getActiveCount() {
        // Assuming "active" means recent or ongoing. For now, just counting all.
        // In a real app, we might have a 'status' field or use date range.
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM PRODUCTIONS');
        return rows[0].count;
    }
    static async create(data) {
        const { date_production, quantite_produite, id_gadget } = data;
        const [result] = await pool.execute('INSERT INTO PRODUCTIONS (date_production, quantite_produite, id_gadget) VALUES (?, ?, ?)', [date_production, quantite_produite, id_gadget]);
        return result.insertId;
    }
}
