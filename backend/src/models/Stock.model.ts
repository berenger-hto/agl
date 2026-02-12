import { pool } from '../config/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Stock {
    id_stock: number;
    quantite_disponible: number;
    id_gadget: number;
    // Join fields
    nom_gadget?: string;
    type_gadget?: string;
    prix_vente_gadget?: number;
}

export class StockModel {
    static async getAll() {
        const query = `
      SELECT s.*, g.nom_gadget, g.type_gadget, g.prix_vente_gadget
      FROM STOCKS s
      JOIN GADGETS g ON s.id_gadget = g.id_gadget
    `;
        const [rows] = await pool.execute<RowDataPacket[]>(query);
        return rows;
    }

    static async updateQuantity(id_gadget: number, quantityChange: number) {
        // Check if stock exists
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM STOCKS WHERE id_gadget = ?', [id_gadget]);

        if (rows.length === 0) {
            // Create if not exists (assuming initial stock 0)
            await pool.execute<ResultSetHeader>('INSERT INTO STOCKS (quantite_disponible, id_gadget) VALUES (?, ?)', [quantityChange, id_gadget]);
        } else {
            await pool.execute<ResultSetHeader>('UPDATE STOCKS SET quantite_disponible = quantite_disponible + ? WHERE id_gadget = ?', [quantityChange, id_gadget]);
        }
        return true;
    }
    static async getLowStockCount(threshold: number = 10) {
        const [rows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM STOCKS WHERE quantite_disponible < ?', [threshold]);
        return rows[0].count;
    }
}
