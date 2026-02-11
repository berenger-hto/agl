import mysql2 from "mysql2/promise"
import {env} from "./env.js";

export const pool = mysql2.createPool({
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME
})
