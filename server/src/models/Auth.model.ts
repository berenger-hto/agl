import {pool} from "../config/pool.js";
import type {ResultSetHeader, RowDataPacket} from "mysql2";
import type {User} from "../ts/types.js";
import {formatDate} from "../functions/fomatDate.js";
import bcrypt from "bcryptjs"

export class AuthModel {
    /**
     * Rechercher l'utilisateur en utilisant son email
     */
    async findUserByEmail(email: string) {
        const [rows] = await pool.execute<(RowDataPacket & { id: number, password: string })[]>(
            "SELECT id, password FROM users WHERE email = ?",
            [email]
        )

        if (rows.length === 0) return null
        return rows[0]
    }

    async getUserData(id: string | number) {
        const [rows] = await pool.execute<(RowDataPacket & User & { email_verified: boolean })[]>("SELECT * FROM users WHERE id = ?", [id])
        if (rows.length === 0) return null
        return rows[0]
    }

    async hashPassword(password: string) {
        return await bcrypt.hash(password, await bcrypt.genSalt(10))
    }

    async verifyPassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash)
    }

    /**
     * Enregistrer l'utilisateur dans la base de donnée
     */
    async saveUser(data: (Omit<User, "id"> & { terms: string })) {
        const { firstname, lastname, email, password: p, profil, studyOption, domain, birthday, terms } = data
        const password = await this.hashPassword(p)

        const [rows] = await pool.execute<ResultSetHeader>(
            "INSERT INTO users (firstname, lastname, email, password, profil, studyOption, domain, birthday, terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [firstname, lastname, email, password, profil, studyOption, domain, formatDate(birthday), terms === "true" ? 1 : 0]
        )

        return { save: rows.affectedRows > 0, userId: rows.insertId }
    }

    async createVerifyMailToken(id: number | string, token: string) {
        const [rows] = await pool.execute<ResultSetHeader>("UPDATE users SET email_verification_token = ?, email_verification_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?",
            [token, id]
        )

        return rows.affectedRows > 0
    }

    async deleteUser(id: string | number) {
        const [rows] = await pool.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [id])
        return rows.affectedRows > 0
    }

    async verifyUserToken(data: { id: number, token: string }) {
        const [rows] = await pool.execute<(RowDataPacket & { id: string | number })[]>("SELECT id FROM users WHERE id = ? AND email_verification_token = ? AND email_verification_expires > NOW()",
            [data.id, data.token]
        )

        if (rows.length === 0) return false
        const [rowsUpdate] = await pool.execute<ResultSetHeader>("UPDATE users SET email_verified = true, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?", [data.id])
        return rowsUpdate.affectedRows > 0
    }

    async emailVerified(id: string | number) {
        const [rows] = await pool.execute<(RowDataPacket & { email_verified: boolean })[]>("SELECT email_verified FROM users WHERE id = ?", [id])
        return rows.length > 0 && rows[0].email_verified
    }
}