import { Context } from 'hono';
import { ClientModel } from '../models/Client.model.js';

export class ClientController {
    static async create(c: Context) {
        try {
            const body = await c.req.json();
            if (!body.nom_client || !body.prenom_client) {
                return c.json({ error: 'Missing required fields (nom, prenom)' }, 400);
            }

            const insertId = await ClientModel.create(body);
            return c.json({ success: true, id: insertId }, 201);
        } catch (error) {
            console.error('Error creating client:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }

    static async getAll(c: Context) {
        try {
            const clients = await ClientModel.getAll();
            return c.json(clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }

    static async update(c: Context) {
        try {
            const id = Number(c.req.param('id'));
            const body = await c.req.json();
            if (isNaN(id)) {
                return c.json({ error: 'Invalid ID' }, 400);
            }
            await ClientModel.update(id, body);
            return c.json({ success: true });
        } catch (error) {
            console.error('Error updating client:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }

    static async delete(c: Context) {
        try {
            const id = Number(c.req.param('id'));
            if (isNaN(id)) {
                return c.json({ error: 'Invalid ID' }, 400);
            }
            await ClientModel.delete(id);
            return c.json({ success: true });
        } catch (error) {
            console.error('Error deleting client:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
