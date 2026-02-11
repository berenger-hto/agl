import {serve} from '@hono/node-server'
import {type Context, Hono} from 'hono'
import {IndexController} from "./controllers/Index.controller.js";
import {AuthController} from "./controllers/Auth.controller.js";
import {HTTPException} from "hono/http-exception";
import {cors} from "hono/cors";
import {env} from "./config/env.js";
import {createServer} from "node:https"
import {readFileSync, existsSync} from "node:fs"
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import {AuthService} from "./services/Auth.service.js";
import {UserController} from "./controllers/User.controller.js";

const app = new Hono()
const prefix = "/v1/"

app.use("*", cors({
    origin: ["https://localhost:5173"],
    credentials: true
}))

app.get(prefix + "index", IndexController.index)
app.post(prefix + "auth/register", AuthController.register)
app.get(prefix + "auth/verify-account", AuthController.verifyToken)
app.post(prefix + "auth/resent-mail", AuthController.resentMail)
app.get("env", (c) => {
    return c.json(env)
})
app.post(prefix + "auth/login", AuthController.login)
app.get(prefix + "me", AuthService.protectedRoute, UserController.me)

// Custom route error

app.notFound((c) => {
    return c.json({
        message: `Route '${c.req.path}' non définie`,
        success: false
    }, 404)
})

app.onError((error, c) => {
    console.error(error)
    const status = error instanceof HTTPException ? error.status : 500
    return c.json({
        message: error.message,
        success: false,
    }, status)
})

const path = join(dirname(fileURLToPath(import.meta.url)))
const keyPath = join(path, "../../localhost+3-key.pem")
const certPath = join(path, "../../localhost+3.pem")
if (!existsSync(keyPath) || !existsSync(certPath)) throw new HTTPException(500, {message: "Certificats non trouvé !"})

serve({
    fetch: app.fetch,
    port: 3000,
    createServer: createServer,
    serverOptions: {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath)
    }
}, (info) => {
    console.log(`Server is running on https://localhost:${info.port}`)
})

