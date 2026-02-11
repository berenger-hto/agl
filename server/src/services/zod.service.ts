import z from "zod";

export const registerSchema = z.object({
    firstname: z
        .string("Renseignez votre nom")
        .min(1, "Votre nom est trop court"),

    lastname: z
        .string("Renseignez votre prénom")
        .min(2, "Votre prénom est trop court"),

    email: z
        .email("Adresse mail invalide"),

    password: z
        .string("Vous devez créer un mot de passe")
        .min(8, "Votre mot de passe est trop court"),

    profil: z
        .number("Aucun profil n'a été choisi")
        .int()
        .refine(p => p >= 0 && p < 4 , "Votre profil est invalide"),

    studyOption: z
        .string("Aucun niveau d'étude n'a été choisi")
        .min(1, "Niveau d'étude invalide"),

    domain: z
        .string("Aucun domaine principal n'a été renseigné")
        .min(1, "Votre domaine est invalide"),

    birthday: z
        .string("Indiquez votre date de naissance")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La date ne respecte pas le format requis")
        .transform((value) => new Date(value))
        .refine(
            (date) => !isNaN(date.getTime()),
            "Date de naissance invalide"
        ),

    terms: z
        .string("Vous n'avez pas accepté les conditions").refine(t => t === "true", "Vous n'avez pas accepté les conditions")
})

export const verifyTokenSchema = z.object({
    token: z
        .string("Token invalide")
        .length(64, "Token invalide")
        .regex(/^[a-f0-9]+$/, "Token invalide"),
    id: z
        .string("Token invalide")
        .transform(v => parseInt(v) / 9876543210)
})

export const resentMailSchema = z.object({
    id: z
        .string("Identifiant invalide")
        .transform(v => parseInt(v) / 9876543210)
})

export const loginSchema = z.object({
    email: z
        .email("Adresse mail invalide"),

    password: z
        .string("Votre mot de passe doit être de 8 caractères minimum")
        .min(8, "Votre mot de passe doit être de 8 caractères minimum")
})