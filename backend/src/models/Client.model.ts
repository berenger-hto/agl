import { pool } from '../config/pool.js';
import { ResultSetHeader } from 'mysql2';

export interface Client {
    id_client?: number;
    nom_client: string;
    prenom_client: string;
    email_client: string;
    contact_client: string;
    adresse_client: string;
}

export class ClientModel {
    static async create(client: Client): Promise<number> {
        const query = 'INSERT INTO CLIENTS (nom_client, prenom_client, email_client, contact_client, adresse_client) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.execute<ResultSetHeader>(query, [
            client.nom_client,
            client.prenom_client,
            client.email_client,
            client.contact_client,
            client.adresse_client
        ]);
        return result.insertId;
    }

    static async getAll() {
        const query = 'SELECT * FROM CLIENTS ORDER BY id_client DESC';
        const [rows] = await pool.execute(query);
        return rows;
    }

    static async update(id: number, client: Client): Promise<void> {
        const query = 'UPDATE CLIENTS SET nom_client = ?, prenom_client = ?, email_client = ?, contact_client = ?, adresse_client = ? WHERE id_client = ?';
        await pool.execute(query, [
            client.nom_client,
            client.prenom_client,
            client.email_client,
            client.contact_client,
            client.adresse_client,
            id
        ]);
    }

    static async delete(id: number): Promise<void> {
        const query = 'DELETE FROM CLIENTS WHERE id_client = ?';
        await pool.execute(query, [id]);
    }
}
