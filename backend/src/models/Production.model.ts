import { pool } from '../config/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Production {
    id_production: number;
    date_production: Date;
    quantite_produite: number;
    id_gadget: number;
}

export class ProductionModel {
    static async getAll() {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM PRODUCTIONS ORDER BY date_production DESC');
        return rows;
    }

    static async getActiveCount() {
        // Assuming "active" means recent or ongoing. For now, just counting all.
        // In a real app, we might have a 'status' field or use date range.
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM PRODUCTIONS');
        return rows[0].count;
    }

    static async create(data: Omit<Production, 'id_production'>) {
        const { date_production, quantite_produite, id_gadget } = data;
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO PRODUCTIONS (date_production, quantite_produite, id_gadget) VALUES (?, ?, ?)',
            [date_production, quantite_produite, id_gadget]
        );
        return result.insertId;
    }
}
