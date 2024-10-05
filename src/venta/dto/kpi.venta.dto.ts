import { IsDateString, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";


export class KpiDto{

    @IsMongoId()
    empresa: string;
    @IsMongoId({ each: true })
    @IsOptional()
    sucursal: Types.ObjectId[];

    @IsOptional()
    tipoVenta: Types.ObjectId;
  
    @IsOptional()
    @IsDateString()
    fechaInicio: string;
  
    @IsOptional()
    @IsDateString()
    FechaFin: string;

}