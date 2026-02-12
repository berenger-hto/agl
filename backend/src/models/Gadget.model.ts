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

    static async getAll() {
        const query = `
            SELECT g.*, COALESCE(s.quantite_disponible, 0) as quantite_disponible 
            FROM GADGETS g 
            LEFT JOIN STOCKS s ON g.id_gadget = s.id_gadget
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    static async delete(id: number): Promise<void> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Delete associated participations (via productions)
            const [productions] = await connection.execute<ResultSetHeader[]>(
                'SELECT id_production FROM PRODUCTIONS WHERE id_gadget = ?',
                [id]
            );

            // Type assertion for production rows to avoid TS error if needed, 
            // but for now relying on the fact we need IDs. 
            // Better to cast to RowDataPacket[] for select.
            const productionIds = (productions as any[]).map(p => p.id_production);

            if (productionIds.length > 0) {
                // Delete participations for these productions
                // Using simple loop or IN clause. IN clause is safer for bulk but need to construct placeholders
                const placeholders = productionIds.map(() => '?').join(',');
                await connection.execute(
                    `DELETE FROM PARTICIPER WHERE id_production IN (${placeholders})`,
                    productionIds
                );
            }

            // 2. Delete associated productions
            await connection.execute('DELETE FROM PRODUCTIONS WHERE id_gadget = ?', [id]);

            // 3. Delete Stock (Cascade might handle this if defined, but explicit is safer per requirements)
            // Checking DB Schema: STOCKS has FK ON DELETE CASCADE. 
            // But requirement says "supprimer... le stock associé".
            // Let's invoke explicit delete for safety/clarity given the prompt.
            await connection.execute('DELETE FROM STOCKS WHERE id_gadget = ?', [id]);

            // 4. Delete Gadget
            await connection.execute('DELETE FROM GADGETS WHERE id_gadget = ?', [id]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
