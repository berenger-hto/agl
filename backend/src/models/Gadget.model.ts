import { pool } from '../config/pool.js';
import { ResultSetHeader } from 'mysql2';

export interface Gadget {
    id_gadget?: number;
    nom_gadget: string;
    type_gadget: string;
    prix_vente_gadget: number;
    description_gadget: string;
}

export class GadgetModel {
    static async create(gadget: Gadget): Promise<number> {
        const query = 'INSERT INTO GADGETS (nom_gadget, type_gadget, prix_vente_gadget, description_gadget) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute<ResultSetHeader>(query, [
            gadget.nom_gadget,
            gadget.type_gadget,
            gadget.prix_vente_gadget,
            gadget.description_gadget
        ]);
        return result.insertId;
    }

    static async getAll() { // Useful for dropdowns
        const [rows] = await pool.execute('SELECT * FROM GADGETS');
        return rows;
    }
}
