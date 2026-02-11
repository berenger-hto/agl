import { pool } from '../config/pool.js';
export class VenteModel {
    static async getTotalRevenue() {
        // Join VENTES, CONCERNER to calculate total revenue
        // price * quantity
        const query = `
      SELECT SUM(c.quantite_vendue * c.prix_unitaire_appliquer) as total_revenue
      FROM VENTES v
      JOIN CONCERNER c ON v.id_vente = c.id_vente
    `;
        const [rows] = await pool.execute(query);
        return rows[0].total_revenue || 0;
    }
    static async getNewOrdersCount() {
        // Count sales in the last 30 days for example, or just total for now
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM VENTES');
        return rows[0].count;
    }
}
