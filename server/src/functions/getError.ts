import {HTTPException} from "hono/http-exception";
import z from "zod"
import type { ContentfulStatusCode } from "hono/utils/http-status";

type ErrorType = {
    message: string
    status: ContentfulStatusCode
}

export function getError(e: unknown): ErrorType {
    if (e instanceof HTTPException) return { message: e.message, status: e.status }
    if (e instanceof z.ZodError) return { message: e.issues[0].message, status: 409 }
    return { message: "Une erreur inattendue s'est produite. Contactez l'administrateur", status: 500 }
}