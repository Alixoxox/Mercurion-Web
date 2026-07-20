import { Product } from "./product";

export interface user {
    id:number,
    name: string,
    password: string,
    email: string,
    cart: Product[]
}