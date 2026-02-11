import nodemailer from "nodemailer"
import {env} from "./env.js";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "applearnz.ai@gmail.com",
        pass: env.MAIL_PASS
    },
});