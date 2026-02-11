import { Context } from 'hono';
import { StockModel } from '../models/Stock.model.js';

export class StockController {
    static async getAll(c: Context) {
        try {
            const stocks = await StockModel.getAll();
            return c.json(stocks);
        } catch (error) {
            console.error('Error fetching stocks:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
