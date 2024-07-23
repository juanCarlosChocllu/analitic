import { Types } from "mongoose";
import { Flag } from "../enums/flag.enum";

export interface SucursalInterface {
    _id: string;
    nombre: string;
    ciudad: string;
    flag: Flag;
}


export interface sucursalNombreI{
    _id:Types.ObjectId,
    nombre:string
}