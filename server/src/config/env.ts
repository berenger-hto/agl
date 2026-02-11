import dotenv from "dotenv"

type EnvKey = {
    [key: string]: string
}

dotenv.config()
export const env = process.env as EnvKey