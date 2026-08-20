import { Product } from "./product";

export interface user {
    id:number,
    name?: string | null,
    password: string,
    email: string,
    role: string,
    cart: Product[]
}

export interface AuthResponse {
    Token: string,
    UserData: { id: number, name: string, email: string, role: string}
}
