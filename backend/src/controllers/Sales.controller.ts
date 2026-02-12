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
}
