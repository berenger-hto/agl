import {sign, verify} from "hono/jwt";
import {env} from "../config/env.js";
import {getCookie, setCookie} from "hono/cookie";
import type {Context, Next} from "hono";
import {HTTPException} from "hono/http-exception";

type Payload = {
    sub: number | string
    [key: string]: string | number
}

export class AuthService {
    static async signAndSetJWTKey(c: Context, p: Payload, exp: number = 86400) {
        try {
            const token = await sign({
                ...p,
                exp: Math.floor(Date.now() / 1000) + exp
            }, env.JWT_SECRET)

            setCookie(c, "accessToken", token, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "None",
                maxAge: exp
            })
        } catch (e) {
            throw new HTTPException(500, { message: "Impossible de générer le token d'authentification", cause: e })
        }
    }

    static async protectedRoute(c: Context, next: Next) {
       try {
           const token = getCookie(c, "accessToken")
           if (token) {
               const userData = await verify(token, env.JWT_SECRET)
               c.set("userId", userData.sub)
               await next()
           }
       } catch (e) {
            throw new HTTPException(401, { message: "Utilisateur non authentifié !", cause: e })
       }
    }
}
