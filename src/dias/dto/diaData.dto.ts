import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { Types } from "mongoose";
import { DiaEstadoE } from "../enums/diaEstado";

export class DiaDto{
    @IsMongoId()
    sucursal:Types.ObjectId
    @IsDateString()
    dia:Date

   @IsEnum(DiaEstadoE)
    @IsNotEmpty()
    estado:string
}