
import { ProductionModel } from './models/Production.model.js';
import { pool } from './config/pool.js';

async function verify() {
    try {
        console.log("Starting verification...");

        // 1. Get a test gadget
        const [gadgets] = await pool.execute<any[]>('SELECT id_gadget, nom_gadget FROM GADGETS LIMIT 1');
        if (gadgets.length === 0) {
            console.error("No gadgets found. Create a gadget first.");
            return;
        }
        const gadget = gadgets[0];
        console.log(`Test Gadget: ${gadget.nom_gadget} (ID: ${gadget.id_gadget})`);

        // 2. Get current stock
        const [initialStock] = await pool.execute<any[]>('SELECT quantite_disponible FROM STOCKS WHERE id_gadget = ?', [gadget.id_gadget]);
        const initialQty = initialStock.length > 0 ? initialStock[0].quantite_disponible : 0;
        console.log(`Initial Stock: ${initialQty}`);

        // 3. Create production
        const prodQty = 50;
        console.log(`Creating production of ${prodQty} units...`);

        const prodData = {
            date_production: new Date(),
            quantite_produite: prodQty,
            id_gadget: gadget.id_gadget,
            agents: [] // No agents for this simple test to avoid FK issues
        };

        const prodId = await ProductionModel.createWithDetails(prodData);
        console.log(`Production created with ID: ${prodId}`);

        // 4. Verify new stock
        const [finalStock] = await pool.execute<any[]>('SELECT quantite_disponible FROM STOCKS WHERE id_gadget = ?', [gadget.id_gadget]);
        const finalQty = finalStock.length > 0 ? finalStock[0].quantite_disponible : 0;
        console.log(`Final Stock: ${finalQty}`);

        if (finalQty === initialQty + prodQty) {
            console.log("SUCCESS: Stock updated correctly.");
        } else {
            console.error(`FAILURE: Stock did not update correctly. Expected ${initialQty + prodQty}, got ${finalQty}`);
        }

    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        pool.end();
    }
}

verify();
