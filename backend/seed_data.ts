import { pool } from './src/config/pool';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function seedData() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if user exists
        const [existing] = await connection.execute<RowDataPacket[]>('SELECT * FROM EMPLOYES WHERE email_employe = ?', ['admin@gestpme.com']);

        if (existing.length === 0) {
            console.log('Seeding default admin user...');

            // Insert into EMPLOYES
            const [empResult] = await connection.execute<ResultSetHeader>(
                'INSERT INTO EMPLOYES (nom_employe, prenom_employe, email_employe, adresse_employe) VALUES (?, ?, ?, ?)',
                ['Admin', 'System', 'admin@gestpme.com', '123 Admin St']
            );

            const empId = empResult.insertId;
            console.log(`Created Employee with ID: ${empId}`);

            // Insert into ADMINISTRATIFS
            await connection.execute(
                'INSERT INTO ADMINISTRATIFS (matricule_employe, poste_administratif) VALUES (?, ?)',
                [empId, 'Directeur Général']
            );

            console.log('Assigned Admin role.');
        } else {
            console.log('Default admin user already exists.');
        }

        // Check if gadgets exist
        const [existingGadgets] = await connection.execute<RowDataPacket[]>('SELECT * FROM GADGETS LIMIT 1');

        if (existingGadgets.length === 0) {
            console.log('Seeding default gadgets...');
            await connection.query(
                'INSERT INTO GADGETS (nom_gadget, type_gadget, prix_vente_gadget, description_gadget) VALUES ?',
                [[
                    ['Super Drone X1', 'Electronics', 499.99, 'High performance drone'],
                    ['Smart Collar', 'Wearable', 129.50, 'GPS tracking collar'],
                    ['Auto Feeder Pro', 'Home', 250.00, 'Automated pet feeder']
                ]]
            );
            console.log('Gadgets seeded.');
        } else {
            console.log('Gadgets already exist.');
        }

        await connection.commit();
        console.log('Seeding completed successfully.');

    } catch (error) {
        await connection.rollback();
        console.error('Seeding failed:', error);
    } finally {
        connection.release();
        await pool.end();
    }
}

seedData();
