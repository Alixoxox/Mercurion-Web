import { Product } from "./product";

export interface user {
    id:number,
    name: string,
    password: string,
    email: string,
    cart: Product[]
}

export interface AuthResponse {
    Token: string,
    UserData: { id: number, name: string, email: string }
}
