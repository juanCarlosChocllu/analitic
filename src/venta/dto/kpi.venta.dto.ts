import { IsDateString, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";


export class KpiDto{
    @IsMongoId()
    @IsOptional()
    empresa: string;
    @IsMongoId({ each: true })
    @IsOptional()
    sucursal: Types.ObjectId[];
  
    @IsOptional()
    @IsDateString()
    fechaInicio: string;
  
    @IsOptional()
    @IsDateString()
    fechaFin: string;

}