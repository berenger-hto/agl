import { VenteModel } from '../models/Vente.model.js';
import { ProductionModel } from '../models/Production.model.js';
export class DashboardController {
    static async getStats(c) {
        try {
            const revenue = await VenteModel.getTotalRevenue();
            const activeProductions = await ProductionModel.getActiveCount();
            const newOrders = await VenteModel.getNewOrdersCount();
            // Mock system uptime for now as it's not in DB
            const systemUptime = 99.8;
            const stats = {
                revenue,
                activeProductions,
                newOrders,
                systemUptime
            };
            return c.json(stats);
        }
        catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
