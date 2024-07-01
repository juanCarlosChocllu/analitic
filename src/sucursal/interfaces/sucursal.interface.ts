import { Flag } from "../enums/flag.enum";

export interface SucursalInterface {
    _id: string;
    nombre: string;
    ciudad: string;
    flag: Flag;
}