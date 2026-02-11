import type {Context} from "hono";
import {UserModel} from "../models/User.model.js";
import {getError} from "../functions/getError.js";
import {HTTPException} from "hono/http-exception";

const userModel = new UserModel()

export class UserController {
    static async me(c: Context) {
       try {
           const userId = c.get("userId") as number
           const { isValid, user } = await userModel.userIsValid(userId)
           if (!isValid) throw new HTTPException(401, { message: "Utilisateur inexistant" })

           return c.json({
               success: true,
               message: "Utilisateur authentifié !",
               user
           })
       } catch (e) {
           const { status, message } = getError(e)
           throw new HTTPException(status, { message, cause: e })
       }
    }
}