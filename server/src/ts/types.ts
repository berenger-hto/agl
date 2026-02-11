export type User = {
    id: number
    firstname: string
    lastname: string
    email: string
    password: string
    profil: number
    studyOption: string
    domain: string
    birthday: Date
}

export type UserAuthenticated = {
    id: number
    firstname: string
    lastname: string
    email: string
}