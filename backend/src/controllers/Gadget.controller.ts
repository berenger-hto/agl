import { Context } from 'hono';
import { GadgetModel } from '../models/Gadget.model.js';

export class GadgetController {
    static async create(c: Context) {
        try {
            const body = await c.req.json();
            if (!body.nom_gadget || !body.type_gadget || !body.prix_vente_gadget) {
                return c.json({ error: 'Missing required fields' }, 400);
            }

            const insertId = await GadgetModel.create(body);
            return c.json({ success: true, id: insertId }, 201);
        } catch (error) {
            console.error('Error creating gadget:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
