import { pool } from '../config/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Production {
    id_production: number;
    date_production: Date;
    quantite_produite: number;
    id_gadget: number;
    agents?: number[];
}

export class ProductionModel {
    static async createWithDetails(data: Omit<Production, 'id_production'>) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { date_production, quantite_produite, id_gadget, agents } = data;

            // 1. Create Production
            const [prodResult] = await connection.execute<ResultSetHeader>(
                'INSERT INTO PRODUCTIONS (date_production, quantite_produite, id_gadget) VALUES (?, ?, ?)',
                [date_production, quantite_produite, id_gadget]
            );
            const productionId = prodResult.insertId;

            // 2. Link Agents (PARTICIPER)
            if (agents && agents.length > 0) {
                const values = agents.map(agentId => [productionId, agentId, 0]); // 0 for duration as default
                // Flatten the array for the query
                const flatValues = values.flat();
                const placeholders = values.map(() => '(?, ?, ?)').join(', ');

                await connection.execute(
                    `INSERT INTO PARTICIPER (id_production, matricule_employe, duree_participation) VALUES ${placeholders}`,
                    flatValues
                );
            }

            // 3. Update Stock
            // Check if stock exists
            const [stockRows] = await connection.execute<RowDataPacket[]>(
                'SELECT id_stock, quantite_disponible FROM STOCKS WHERE id_gadget = ?',
                [id_gadget]
            );

            if (stockRows.length > 0) {
                // Update existing
                await connection.execute(
                    'UPDATE STOCKS SET quantite_disponible = quantite_disponible + ? WHERE id_gadget = ?',
                    [quantite_produite, id_gadget]
                );
            } else {
                // Create new
                await connection.execute(
                    'INSERT INTO STOCKS (quantite_disponible, id_gadget) VALUES (?, ?)',
                    [quantite_produite, id_gadget]
                );
            }

            await connection.commit();
            return productionId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
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
