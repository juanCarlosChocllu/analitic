import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";


export class KpiDto{
    @IsMongoId()
    empresa: string;

    @IsMongoId({ each: true })
    @IsOptional()
    sucursal: Types.ObjectId[];

    @IsMongoId({ each: true })
    @IsOptional()
    tipoVenta: Types.ObjectId[];
    
    @IsOptional()
    @IsBoolean()
    comisiona:boolean | null
    
    @IsDateString()
    fechaInicio: string;
  
   
    @IsDateString()
    FechaFin: string;

}