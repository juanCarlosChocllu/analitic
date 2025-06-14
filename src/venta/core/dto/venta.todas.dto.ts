import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { EstadoEnum } from "../enums/estado.enum";

export class VentaTodasDto{
    @IsMongoId({each: true })
    empresa: string[];

    @IsMongoId({each: true })
    sucursal: Types.ObjectId[];
    
    @IsMongoId({ each: true })
    @IsOptional()
    tipoVenta: Types.ObjectId[];

    @IsEnum(EstadoEnum)
    @IsNotEmpty()
    flagVenta:string

    @IsOptional()
    @IsBoolean()
    comisiona:boolean | null
    
    @IsDateString()
    fechaInicio: string;
  
   
    @IsDateString()
    fechaFin: string;

}