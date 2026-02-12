import { pool } from '../config/pool.js';
export class EmployeeModel {
    static async getAll() {
        const query = `
            SELECT e.*, 
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
        const [rows] = await pool.execute(query);
        return rows;
    }
    static async getHierarchy() {
        const employees = await this.getAll();
        // Build the tree
        const employeeMap = new Map();
        employees.forEach(emp => {
            emp.children = [];
            employeeMap.set(emp.matricule_employe, emp);
        });
        const rootEmployees = [];
        employees.forEach(emp => {
            if (emp.matricule_employe_Superviseur) {
                const supervisor = employeeMap.get(emp.matricule_employe_Superviseur);
                if (supervisor) {
                    supervisor.children?.push(emp);
                }
                else {
                    // Fallback if supervisor not found
                    rootEmployees.push(emp);
                }
            }
            else {
                rootEmployees.push(emp);
            }
        });
        return rootEmployees;
    }
}
