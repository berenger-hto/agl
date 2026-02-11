import {IndexModel} from "../models/Index.model.js";
import {type Context} from "hono";

export class IndexController {
    static index(c: Context) {
        return c.text(IndexModel.getMessage())
    }
}