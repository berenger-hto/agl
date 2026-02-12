import { Context } from 'hono';
import { VenteModel } from '../models/Vente.model.js';
import { StockModel } from '../models/Stock.model.js';
import { pool } from '../config/pool.js';
import { RowDataPacket } from 'mysql2';

export class SalesController {
    static async processSale(c: Context) {
        const connection = await pool.getConnection(); // Get distinct connection for transaction
        try {
            await connection.beginTransaction();

            const body = await c.req.json();
            const items = body.items as { id_gadget: number; quantity: number }[];

            if (!items || items.length === 0) {
                throw new Error("No items in cart");
            }

            if (!body.id_client) {
                throw new Error("Client ID is required");
            }

            // Validate Cashier Credentials
            if (!body.matricule_employe || !body.code_acces) {
                throw new Error("Cashier selection and access code are required");
            }

            const cashierId = body.matricule_employe;
            const accessCode = body.code_acces;
            const clientId = body.id_client;

            // Verify Cashier and Access Code
            const [cashierRows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM CAISSIERS WHERE matricule_employe = ? AND code_acces = ?',
                [cashierId, accessCode]
            );

            if (cashierRows.length === 0) {
                throw new Error("Invalid cashier credentials");
            }

            // 2. Create Vente
            const [venteResult] = await connection.execute<any>(
                'INSERT INTO VENTES (date_vente, matricule_employe, id_client) VALUES (NOW(), ?, ?)',
                [cashierId, clientId]
            );
            const venteId = venteResult.insertId;

            let totalAmount = 0;

            // 3. Process Items
            for (const item of items) {
                // Get current price and verify stock
                const [gadgets] = await connection.execute<RowDataPacket[]>(
                    'SELECT prix_vente_gadget FROM GADGETS WHERE id_gadget = ?',
                    [item.id_gadget]
                );

                if (gadgets.length === 0) throw new Error(`Gadget ${item.id_gadget} not found`);
                const price = gadgets[0].prix_vente_gadget;

                // Check stock
                const [stocks] = await connection.execute<RowDataPacket[]>(
                    'SELECT quantite_disponible FROM STOCKS WHERE id_gadget = ? FOR UPDATE',
                    [item.id_gadget]
                );

                if (stocks.length === 0 || stocks[0].quantite_disponible < item.quantity) {
                    throw new Error(`Insufficient stock for gadget ${item.id_gadget}`);
                }

                // Deduct Stock
                await connection.execute(
                    'UPDATE STOCKS SET quantite_disponible = quantite_disponible - ? WHERE id_gadget = ?',
                    [item.quantity, item.id_gadget]
                );

                // Add to Concerner
                await connection.execute(
                    'INSERT INTO CONCERNER (id_gadget, id_vente, quantite_vendue, prix_unitaire_appliquer) VALUES (?, ?, ?, ?)',
                    [item.id_gadget, venteId, item.quantity, price]
                );

                totalAmount += price * item.quantity;
            }

            // 4. Create Facture
            const invoiceNumber = `INV-${Date.now()}`;
            await connection.execute(
                'INSERT INTO FACTURES (numero_facture, date_facture, montant_total, id_vente) VALUES (?, NOW(), ?, ?)',
                [invoiceNumber, totalAmount, venteId]
            );

            await connection.commit();
            return c.json({ success: true, invoiceNumber, totalAmount });

        } catch (error: any) {
            await connection.rollback();
            console.error('Sale transaction failed:', error);
            return c.json({ error: error.message || 'Transaction failed' }, 500);
        } finally {
            connection.release();
        }
    }

    static async getInvoice(c: Context) {
        const id = c.req.param('id');
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(`
                SELECT 
                    f.numero_facture, 
                    f.date_facture, 
                    f.montant_total,
                    v.date_vente,
                    c.nom_client,
                    c.prenom_client,
                    c.email_client,
                    e.nom_employe as nom_vendeur,
                    e.prenom_employe as prenom_vendeur
                FROM FACTURES f
                JOIN VENTES v ON f.id_vente = v.id_vente
                JOIN CLIENTS c ON v.id_client = c.id_client
                JOIN EMPLOYES e ON v.matricule_employe = e.matricule_employe
                WHERE f.numero_facture = ? OR v.id_vente = ?
            `, [id, id]);

            if (rows.length === 0) {
                return c.json({ error: 'Invoice not found' }, 404);
            }

            const invoice = rows[0];

            // Get items
            const [items] = await pool.execute<RowDataPacket[]>(`
                SELECT 
                    g.nom_gadget,
                    g.type_gadget,
                    c.quantite_vendue,
                    c.prix_unitaire_appliquer,
                    (c.quantite_vendue * c.prix_unitaire_appliquer) as total_ligne
                FROM CONCERNER c
                JOIN GADGETS g ON c.id_gadget = g.id_gadget
                JOIN VENTES v ON c.id_vente = v.id_vente
                LEFT JOIN FACTURES f ON f.id_vente = v.id_vente
                WHERE f.numero_facture = ? OR v.id_vente = ?
            `, [id, id]);

            return c.json({ ...invoice, items });
        } catch (error) {
            console.error('Error fetching invoice:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }

    static async getSalesHistory(c: Context) {
        try {
            const [rows] = await pool.execute<RowDataPacket[]>(`
                SELECT 
                    f.numero_facture, 
                    f.date_facture, 
                    f.montant_total,
                    c.nom_client,
                    c.prenom_client,
                    e.prenom_employe as vendeur
                FROM FACTURES f
                JOIN VENTES v ON f.id_vente = v.id_vente
                JOIN CLIENTS c ON v.id_client = c.id_client
                JOIN EMPLOYES e ON v.matricule_employe = e.matricule_employe
                ORDER BY f.date_facture DESC
                LIMIT 50
            `);
            return c.json(rows);
        } catch (error) {
            console.error('Error fetching sales history:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
