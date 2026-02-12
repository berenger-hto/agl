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

            // 1. Create Default Client if needed (Simplified: Using ID 1 or a generic one)
            // In a real app, we would select or create a client.
            // Ensuring Client 1 exists for this demo
            await connection.execute('INSERT IGNORE INTO CLIENTS (id_client, nom_client) VALUES (1, "Walk-in Customer")');
            const clientId = 1;

            // 2. Create Vente
            // Assuming a logged in user with matricule_employe. Using 1 for now if no auth context yet.
            // TODO: Get real employee ID from auth middleware
            const employeeId = 2; // Awa (Caissier) for Demo

            // Ensure logic constraint: Only Caissier can sell. 
            // Checking if Employee 1 is a Caissier in DB would be good practice here.

            const [venteResult] = await connection.execute<any>(
                'INSERT INTO VENTES (date_vente, matricule_employe, id_client) VALUES (NOW(), ?, ?)',
                [employeeId, clientId]
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
}
