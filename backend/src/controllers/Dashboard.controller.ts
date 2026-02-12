import { Context } from 'hono';
import { VenteModel } from '../models/Vente.model.js';
import { ProductionModel } from '../models/Production.model.js';
import { StockModel } from '../models/Stock.model.js';

export class DashboardController {
    static async getStats(c: Context) {
        try {
            const revenue = await VenteModel.getTotalRevenue();
            const activeProductions = await ProductionModel.getActiveCount();
            const newOrders = await VenteModel.getNewOrdersCount();
            const lowStockCount = await StockModel.getLowStockCount(10);
            const salesTrend = await VenteModel.getSalesTrend();
            const stockDistribution = await StockModel.getDistribution();

            // Mock system uptime for now as it's not in DB
            const systemUptime = 99.8;

            const stats = {
                revenue,
                activeProductions,
                newOrders,
                systemUptime,
                lowStockCount,
                salesTrend,
                stockDistribution
            };
            return c.json(stats);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
