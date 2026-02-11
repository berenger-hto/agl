import { pool } from '../config/pool.js';
export class StockModel {
    static async getAll() {
        const query = `
      SELECT s.*, g.nom_gadget, g.type_gadget, g.prix_vente_gadget
      FROM STOCKS s
      JOIN GADGETS g ON s.id_gadget = g.id_gadget
    `;
        const [rows] = await pool.execute(query);
        return rows;
    }
    static async updateQuantity(id_gadget, quantityChange) {
        // Check if stock exists
        const [rows] = await pool.execute('SELECT * FROM STOCKS WHERE id_gadget = ?', [id_gadget]);
        if (rows.length === 0) {
            // Create if not exists (assuming initial stock 0)
            await pool.execute('INSERT INTO STOCKS (quantite_disponible, id_gadget) VALUES (?, ?)', [quantityChange, id_gadget]);
        }
        else {
            await pool.execute('UPDATE STOCKS SET quantite_disponible = quantite_disponible + ? WHERE id_gadget = ?', [quantityChange, id_gadget]);
        }
        return true;
    }
}
