import { IsBoolean, IsDateString, IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class KpiEmpresaDto{
    @IsMongoId({each: true })
    empresa: string;

    @IsMongoId({each: true })
    sucursal: string[];
    
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