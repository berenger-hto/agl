import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { checkConnection } from './config/pool.js';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'], // Vite default port
    credentials: true,
}));

import { DashboardController } from './controllers/Dashboard.controller.js';

app.get('/', (c) => {
    return c.json({ message: 'Welcome to GadgetAn API' });
});

app.get('/health', async (c) => {
    const dbStatus = await checkConnection();
    return c.json({
        status: 'ok',
        database: dbStatus ? 'connected' : 'disconnected'
    });
});

import { ProductionController } from './controllers/Production.controller.js';
import { StockController } from './controllers/Stock.controller.js';
import { SalesController } from './controllers/Sales.controller.js';
import { ClientController } from './controllers/Client.controller.js';
import { EmployeeController } from './controllers/Employee.controller.js';
import { AuthController } from './controllers/Auth.controller.js';
import { GadgetController } from './controllers/Gadget.controller.js';

import { authMiddleware } from './middleware/Auth.middleware.js';

// Public Routes
app.post('/api/auth/login', AuthController.login);

// Protected Routes
app.use('/api/*', authMiddleware);

app.get('/api/dashboard/stats', DashboardController.getStats);
app.get('/api/productions', ProductionController.getAll);
app.post('/api/productions', ProductionController.create);
app.get('/api/stocks', StockController.getAll);
app.post('/api/sales', SalesController.processSale);
app.get('/api/sales', SalesController.getSalesHistory);
app.get('/api/sales/:id', SalesController.getInvoice);
app.get('/api/employees', EmployeeController.getAll);
app.post('/api/employees', EmployeeController.create);
app.post('/api/gadgets', GadgetController.create);
app.get('/api/gadgets', GadgetController.getAll);
app.delete('/api/gadgets/:id', GadgetController.delete);


app.get('/api/clients', ClientController.getAll);
app.post('/api/clients', ClientController.create);
app.put('/api/clients/:id', ClientController.update);
app.delete('/api/clients/:id', ClientController.delete);

app.delete('/api/employees/:id', EmployeeController.delete);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port
});
