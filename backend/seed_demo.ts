import { pool } from './src/config/pool';
import { RowDataPacket } from 'mysql2';

async function seedDemoData() {
    console.log('Starting Demo Seeding...');
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 0. CLEANUP (Order matters due to foreign keys)
        console.log('Cleaning up old data...');
        // Disable foreign key checks to truncate tables freely
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE PARTICIPER');
        await connection.query('TRUNCATE TABLE CONCERNER');
        await connection.query('TRUNCATE TABLE FACTURES');
        await connection.query('TRUNCATE TABLE VENTES');
        await connection.query('TRUNCATE TABLE PRODUCTIONS');
        await connection.query('TRUNCATE TABLE STOCKS');
        await connection.query('TRUNCATE TABLE CLIENTS');
        await connection.query('TRUNCATE TABLE GADGETS');
        await connection.query('TRUNCATE TABLE ADMINISTRATIFS');
        await connection.query('TRUNCATE TABLE AGENTS_PRODUCTIONS');
        await connection.query('TRUNCATE TABLE CAISSIERS');
        await connection.query('TRUNCATE TABLE EMPLOYES');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Cleanup done.');

        // 1. EMPLOYES & HIERARCHY
        console.log('Seeding Employees...');

        // Stéphane (DG)
        await connection.query(
            'INSERT INTO EMPLOYES (matricule_employe, nom_employe, prenom_employe, email_employe, matricule_employe_Superviseur) VALUES (?, ?, ?, ?, ?)',
            [1, 'Kovalsky', 'Stéphane', 's.kovalsky@gadgetan.com', null]
        );
        await connection.query(
            'INSERT INTO ADMINISTRATIFS (matricule_employe, poste_administratif) VALUES (?, ?)',
            [1, 'Directeur Général']
        );

        // Awa (Resp Caisse) -> Supervised by Stéphane
        await connection.query(
            'INSERT INTO EMPLOYES (matricule_employe, nom_employe, prenom_employe, email_employe, matricule_employe_Superviseur) VALUES (?, ?, ?, ?, ?)',
            [2, 'Diallo', 'Awa', 'a.diallo@gadgetan.com', 1]
        );
        await connection.query(
            'INSERT INTO CAISSIERS (matricule_employe, statut_caissier, code_acces) VALUES (?, ?, ?)',
            [2, 'Responsable', 'CAISSE-2026']
        );

        // Jean (Chef Prod) -> Supervised by Stéphane
        await connection.query(
            'INSERT INTO EMPLOYES (matricule_employe, nom_employe, prenom_employe, email_employe, matricule_employe_Superviseur) VALUES (?, ?, ?, ?, ?)',
            [3, 'Dupont', 'Jean', 'j.dupont@gadgetan.com', 1]
        );
        await connection.query(
            'INSERT INTO AGENTS_PRODUCTIONS (matricule_employe, role_agent) VALUES (?, ?)',
            [3, 'Superviseur Technique']
        );


        // 2. CATALOGUE (GADGETS)
        console.log('Seeding Gadgets...');
        await connection.query(
            'INSERT INTO GADGETS (id_gadget, nom_gadget, type_gadget, prix_vente_gadget, description_gadget) VALUES ?',
            [[
                [1, 'Croquettes Premium Chat', 'Alimentation', 45.00, 'Sac de 10kg, sans céréales'],
                [2, 'Balle Rebondissante Neon', 'Jouet', 12.50, 'Balle haute visibilité pour chien'],
                [3, 'Peluche Connectée "SmartPaw"', 'Jouet', 89.00, 'Interagit avec le smartphone'],
                [4, 'Distributeur Automatique', 'Accessoire', 120.00, 'Programmation via Wi-Fi']
            ]]
        );

        // 3. STOCKS
        console.log('Seeding Stocks...');
        await connection.query(
            'INSERT INTO STOCKS (id_gadget, quantite_disponible) VALUES ?',
            [[
                [1, 150], // Stock confortable
                [2, 8],   // STOCK CRITIQUE (Alerte démo !)
                [3, 45],
                [4, 2]    // STOCK CRITIQUE
            ]]
        );

        // 4. CLIENTS
        console.log('Seeding Clients...');
        await connection.query(
            'INSERT INTO CLIENTS (id_client, nom_client, prenom_client, email_client) VALUES ?',
            [[
                [1, 'Martin', 'Sophie', 'sophie.m@email.com'],
                [2, 'Traoré', 'Ismaël', 'isma.t@email.com']
            ]]
        );

        // 5. HISTORIQUE DE VENTES (Chart.js Data)
        console.log('Seeding Sales History...');
        // Dates needs to be in 'YYYY-MM-DD' format
        const today = new Date();
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);

        const fmtDate = (d: Date) => d.toISOString().split('T')[0];

        // Vente 1: Croquettes (2 days ago)
        await connection.query(
            'INSERT INTO VENTES (id_vente, date_vente, matricule_employe, id_client) VALUES (?, ?, ?, ?)',
            [1, fmtDate(twoDaysAgo), 2, 1]
        );
        await connection.query(
            'INSERT INTO CONCERNER (id_gadget, id_vente, quantite_vendue, prix_unitaire_appliquer) VALUES (?, ?, ?, ?)',
            [1, 1, 2, 45.00]
        );

        // Vente 2: Balle (Yesterday)
        await connection.query(
            'INSERT INTO VENTES (id_vente, date_vente, matricule_employe, id_client) VALUES (?, ?, ?, ?)',
            [2, fmtDate(yesterday), 2, 2]
        );
        await connection.query(
            'INSERT INTO CONCERNER (id_gadget, id_vente, quantite_vendue, prix_unitaire_appliquer) VALUES (?, ?, ?, ?)',
            [2, 2, 1, 12.50]
        );

        // Vente 3: Peluche (Today)
        await connection.query(
            'INSERT INTO VENTES (id_vente, date_vente, matricule_employe, id_client) VALUES (?, ?, ?, ?)',
            [3, fmtDate(today), 2, 1]
        );
        await connection.query(
            'INSERT INTO CONCERNER (id_gadget, id_vente, quantite_vendue, prix_unitaire_appliquer) VALUES (?, ?, ?, ?)',
            [3, 3, 1, 89.00]
        );

        await connection.commit();
        console.log('✅ DEMO ENVIRONMENT READY! 🚀');

    } catch (error) {
        await connection.rollback();
        console.error('❌ Seeding failed:', error);
    } finally {
        connection.release();
        await pool.end();
    }
}

seedDemoData();
