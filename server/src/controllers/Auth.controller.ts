import type {Context} from "hono";
import {HTTPException} from "hono/http-exception";
import {AuthModel} from "../models/Auth.model.js";
import {wait} from "../functions/wait.js";
import * as crypto from "node:crypto";
import {getError} from "../functions/getError.js";
import {sendVerificationEmail} from "../services/mail.service.js";
import {loginSchema, registerSchema, resentMailSchema, verifyTokenSchema} from "../services/zod.service.js";
import {AuthService} from "../services/Auth.service.js";

const authModel = new AuthModel()

export class AuthController {
    static async register(c: Context) {
        try {
            const body = registerSchema.parse(await c.req.json())
            const user = await authModel.findUserByEmail(body.email)

            if (user) {
                throw new HTTPException(409, {
                    message: "Un compte existe déjà avec cet email"
                })
            }

            const { save, userId } = await authModel.saveUser(body)
            const token = crypto.randomBytes(32).toString("hex")
            const createVerifyToken = await authModel.createVerifyMailToken(userId, token)

            if (!save || !createVerifyToken) {
                throw new HTTPException(500, {
                    message: "Erreur lors de la création de votre compte. Contactez l'administrateur"
                })
            }

            const sendMail = await sendVerificationEmail(body.email, userId, token)
            if (save && sendMail) {
                return c.json({
                    success: true,
                    message: "Votre compte a été créé !"
                }, 201)
            }

        } catch (e) {
            console.error(e)
            const { message, status } = getError(e)
            throw new HTTPException(status, { message, cause: e })
        }
    }

    static async resentMail(c: Context) {
        try {
            const body = resentMailSchema.parse(await c.req.json())
            const token = crypto.randomBytes(32).toString("hex")
            const user = await authModel.getUserData(body.id)

            if (!user) {
                throw new HTTPException(400, {
                    message: "Identifiant invalide. Assurez-vous de disposer d'un compte sur LearnZ"
                })
            }

            if (user.email_verified) {
                throw new HTTPException(200, {
                    message: "Votre compte a déjà été vérifié"
                })
            }

            const createVerifyToken = await authModel.createVerifyMailToken(body.id, token)
            if (!createVerifyToken) throw new HTTPException(500, {message: "Une erreur s'est produite lors de la création du token"})
            const sendMail = await sendVerificationEmail(user.email, body.id, token)

            if (sendMail) {
                return c.json({
                    message: "Un nouveau mail vous a été envoyé",
                    success: true
                })
            }
        } catch (e) {
            const { message, status } = getError(e)
            throw new HTTPException(status, { message, cause: e })
        }
    }

    static async verifyToken(c: Context) {
        try {
            const body = verifyTokenSchema.parse({
                token: c.req.query("t"),
                id: c.req.query("i")
            })

            const verified = await authModel.emailVerified(body.id)

            if (verified) {
                return c.json({
                    message: "Votre compte a déjà été vérifié",
                    success: true
                })
            }

            const verify = await authModel.verifyUserToken(body)
            if (!verify) {
                throw new HTTPException(401, {
                    message: "Le token de vérification est invalide ou a expiré"
                })
            }

            const user = await authModel.getUserData(body.id)

            if (!user) {
                throw new HTTPException(500, {
                    message: "Une erreur interne s'est produite"
                })
            }

            await AuthService.signAndSetJWTKey(c, {
                sub: user.id
            })

            return c.json({
                success: true,
                message: "Votre compte a bien été vérifié"
            })

        } catch (e) {
            const { message, status } = getError(e)
            throw new HTTPException(status, { message, cause: e })
        }
    }

    static async login(c: Context) {
        await wait(500)

        try {
            const body = loginSchema.parse(await c.req.json())
            const user = await authModel.findUserByEmail(body.email)
            const isValid = user && await authModel.verifyPassword(body.password, user.password)

            if (!isValid) {
                throw new HTTPException(401, {
                    message: "Adresse mail ou mot de passe incorrect"
                })
            }

            await AuthService.signAndSetJWTKey(c, {
                sub: user.id
            })

            return c.json({
                message: "Utilisateur connecté !",
                success: true
            }, 200)

        } catch (e) {
            const { message, status } = getError(e)
            throw new HTTPException(status, { message, cause: e })
        }
    }
}