import { Context } from 'hono';
import { ProductionModel } from '../models/Production.model.js';

export class ProductionController {
    static async getAll(c: Context) {
        try {
            const productions = await ProductionModel.getAll();
            return c.json(productions);
        } catch (error) {
            console.error('Error fetching productions:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }

    static async create(c: Context) {
        try {
            const body = await c.req.json();
            // Basic validation
            if (!body.date_production || !body.quantite_produite || !body.id_gadget) {
                return c.json({ error: 'Missing required fields' }, 400);
            }

            const insertId = await ProductionModel.createWithDetails(body);
            return c.json({ success: true, id: insertId }, 201);
        } catch (error) {
            console.error('Error creating production:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
