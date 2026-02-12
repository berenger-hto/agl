import { pool } from '../config/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Employee {
    matricule_employe: number;
    nom_employe: string;
    prenom_employe: string;
    email_employe: string;
    matricule_employe_Superviseur: number | null;
    poste?: string;
    role_category?: string;
    children?: Employee[];
}

interface CreateEmployeeDTO {
    nom_employe: string;
    prenom_employe: string;
    email_employe: string;
    role: 'Employe' | 'Caissier' | 'Agent' | 'Admin';
    // Role specific fields
    statut_caissier?: string;
    code_acces?: string;
    role_agent?: string;
    poste_administratif?: string;
}

export class EmployeeModel {
    static async getAll() {
        const query = `
            SELECT e.*, 
            CASE 
                WHEN c.matricule_employe IS NOT NULL THEN 'Caissier'
                WHEN a.matricule_employe IS NOT NULL THEN 'Agent'
                WHEN adm.matricule_employe IS NOT NULL THEN 'Admin'
                ELSE 'Employe'
            END as role_category,
            CASE 
                WHEN c.matricule_employe IS NOT NULL THEN c.statut_caissier
                WHEN a.matricule_employe IS NOT NULL THEN a.role_agent
                WHEN adm.matricule_employe IS NOT NULL THEN adm.poste_administratif
                ELSE 'Employe'
            END as poste
            FROM EMPLOYES e
            LEFT JOIN CAISSIERS c ON e.matricule_employe = c.matricule_employe
            LEFT JOIN AGENTS_PRODUCTIONS a ON e.matricule_employe = a.matricule_employe
            LEFT JOIN ADMINISTRATIFS adm ON e.matricule_employe = adm.matricule_employe
        `;
        const [rows] = await pool.execute<RowDataPacket[]>(query);
        return rows as Employee[];
    }

    static async getHierarchy() {
        const employees = await this.getAll();

        // Build the tree
        const employeeMap = new Map<number, Employee>();
        employees.forEach(emp => {
            emp.children = [];
            employeeMap.set(emp.matricule_employe, emp);
        });

        const rootEmployees: Employee[] = [];

        employees.forEach(emp => {
            if (emp.matricule_employe_Superviseur) {
                const supervisor = employeeMap.get(emp.matricule_employe_Superviseur);
                if (supervisor) {
                    supervisor.children?.push(emp);
                } else {
                    // Fallback if supervisor not found
                    rootEmployees.push(emp);
                }
            } else {
                rootEmployees.push(emp);
            }
        });

        return rootEmployees;
    }

    static async create(data: CreateEmployeeDTO): Promise<number> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [res] = await connection.execute<ResultSetHeader>(
                'INSERT INTO EMPLOYES (nom_employe, prenom_employe, email_employe) VALUES (?, ?, ?)',
                [data.nom_employe, data.prenom_employe, data.email_employe]
            );
            const employeeId = res.insertId;

            if (data.role === 'Caissier') {
                await connection.execute(
                    'INSERT INTO CAISSIERS (matricule_employe, statut_caissier, code_acces) VALUES (?, ?, ?)',
                    [employeeId, data.statut_caissier || 'Actif', data.code_acces || '1234']
                );
            } else if (data.role === 'Agent') {
                await connection.execute(
                    'INSERT INTO AGENTS_PRODUCTIONS (matricule_employe, role_agent) VALUES (?, ?)',
                    [employeeId, data.role_agent || 'Ouvrier']
                );
            } else if (data.role === 'Admin') {
                await connection.execute(
                    'INSERT INTO ADMINISTRATIFS (matricule_employe, poste_administratif) VALUES (?, ?)',
                    [employeeId, data.poste_administratif || 'Staff']
                );
            }

            await connection.commit();
            return employeeId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id: number): Promise<void> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Remove from PARTICIPER (if they are an agent and participated in productions)
            await connection.execute('DELETE FROM PARTICIPER WHERE matricule_employe = ?', [id]);

            // 2. Delete from EMPLOYES (Cascades to CAISSIERS, AGENTS_PRODUCTIONS, ADMINISTRATIFS due to DB constraints)
            await connection.execute('DELETE FROM EMPLOYES WHERE matricule_employe = ?', [id]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
