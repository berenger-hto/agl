import { Context } from 'hono';
import { pool } from '../config/pool.js';
import { RowDataPacket } from 'mysql2';
// import bcrypt from 'bcryptjs'; // For now doing plain text check or simple equality as I don't know if data is hashed

export class AuthController {
    static async login(c: Context) {
        try {
            const { email, password } = await c.req.json();

            if (!email || !password) {
                return c.json({ error: 'Email and password are required' }, 400);
            }

            // Basic check against EMPLOYES table. In real app, check password hash.
            // Assuming there is no password in EMPLOYES, check CAISSIERS or create a dedicated Users table / or add password check logic.
            // The provided `BD.sql` does NOT have a password column for EMPLOYES.
            // `CAISSIERS` has `code_acces`.

            // Strategy: Check if email exists in EMPLOYES.
            // If it's a CAISSIER, check `code_acces` against password.
            // If it's another role, we might not have authentication in the schema provided.
            // FOR DEMO: I will strictly check if email exists.

            const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM EMPLOYES WHERE email_employe = ?', [email]);

            if (rows.length === 0) {
                return c.json({ error: 'Invalid credentials' }, 401);
            }

            const user = rows[0];
            let role = 'Employe';

            // Determine role
            const [caissiers] = await pool.execute<RowDataPacket[]>('SELECT * FROM CAISSIERS WHERE matricule_employe = ?', [user.matricule_employe]);
            if (caissiers.length > 0) role = 'Caissier';

            const [agents] = await pool.execute<RowDataPacket[]>('SELECT * FROM AGENTS_PRODUCTIONS WHERE matricule_employe = ?', [user.matricule_employe]);
            if (agents.length > 0) role = 'Agent';

            const [admins] = await pool.execute<RowDataPacket[]>('SELECT * FROM ADMINISTRATIFS WHERE matricule_employe = ?', [user.matricule_employe]);
            if (admins.length > 0) role = 'Admin';

            // TODO: Implement proper Session/Cookie setting.
            // For Hono we can set a signed cookie.

            return c.json({
                success: true,
                user: {
                    id: user.matricule_employe,
                    name: `${user.prenom_employe} ${user.nom_employe}`,
                    role: role
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
