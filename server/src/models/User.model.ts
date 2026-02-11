import {pool} from "../config/pool.js";
import type {RowDataPacket} from "mysql2";
import type {UserAuthenticated} from "../ts/types.js";

export class UserModel {
    async userIsValid(id: number) {
        const [userData] = await pool.execute<(RowDataPacket & UserAuthenticated)[]>("SELECT id, firstname, lastname, email FROM users WHERE id = ?", [id])
        return {
            isValid: userData.length === 1,
            user: userData[0] ?? {}
        }
    }
}