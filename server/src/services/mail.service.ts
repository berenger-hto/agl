import {transporter} from "../config/mail.js";
import {HTTPException} from "hono/http-exception";
import {env} from "../config/env.js";
import {AuthModel} from "../models/Auth.model.js";

export async function sendVerificationEmail(email: string, id: number, token: string) {
    const link = `${env.CLIENT_URL}/verify-account?t=${token}&i=${id * 9876543210}`
    try {
        await transporter.sendMail({
            from: '"LearnZ Account" <me@learnz.com>',
            to: email,
            subject: "Confirmation de votre compte",
            html: `
        <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>LearnZ Mail</title>
                <style>
                    body {
                        font-family: sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        font-size: 30px;
                        font-weight: bold;
                        color: #000; 
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .content {
                        font-size: 16px;
                        line-height: 1.5;
                        color: #333333;
                    }
                    .button-container {
                        text-align: center;
                        margin: 30px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        font-size: 16px;
                        font-weight: bold;
                        color: #ffffff;
                        background-color: #000;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .footer {
                        font-size: 12px;
                        color: #777777;
                        text-align: center;
                        margin-top: 40px;
                        border-top: 1px solid #eeeeee;
                        padding-top: 20px;
                    }
                    .contact-info {
                        margin-top: 10px;
                        font-size: 14px;
                        line-height: 1.4;
                    }
                    .separator {
                        border: 0;
                        border-top: 1px solid #eeeeee;
                        margin: 20px 0;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 25px;
                        margin-bottom: 10px;
                        color: #000;
                    }
                </style>
            </head>
            <body>
                <div class="email-container" style="background: #f5f5f5!important;">
                    <div class="header">
                        LearnZ
                    </div>
                    <div class="content">
                        <p>Bonjour.</p>
                        <p>Toute l'équipe vous souhaite la bienvenue sur <b>LearnZ</b>.</p>
                        <p>Pour profiter pleinement de toutes nos fonctionnalités, une étape rapide est nécessaire.</p>
            
                        <hr class="separator">
            
                        <div class="section-title">Finalisez votre inscription</div>
                        <p>Veuillez cliquer sur le lien ci-dessous pour **vérifier votre adresse e-mail** et activer votre compte :</p>
            
                        <div class="button-container">
                            <a href="${link}" class="button" style="color: #fff!important;">Vérifier mon compte</a>
                        </div>
            
                        <ul>
                            <li>Ce lien est valide pour une durée <b>d'une heure</b></li>
                            <li>Si vous n'êtes pas à l'origine de cette inscription, veuillez simplement ignorer cet e-mail.</li>
                        </ul>
            
                        <hr class="separator">
            
                        <p>Nous restons à votre entière disposition pour toute question.</p>
                        <p>Avec toute notre considération,<br>L'équipe LearnZ</p>
                    </div>
            
                    <div class="footer">
                        <hr>
                        <div class="contact-info">
                            Si vous avez des questions ou rencontrez des difficultés, n'hésitez pas à nous envoyer un e-mail à l'adresse <a href="mailto:applearnz.ai@gmail.com" style="text-decoration: none; color: #000">applearnz.ai@gmail.com</a>. On pourra répondre à vos questions concernant votre compte ou votre vérification.
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `
        })
        return true
    } catch (e) {
        await new AuthModel().deleteUser(id)
        throw new HTTPException(500, { message: "Erreur lors l'envoie du mail de vérification. Réessayez ou contactez l'administrateur", cause: e })
    }
}