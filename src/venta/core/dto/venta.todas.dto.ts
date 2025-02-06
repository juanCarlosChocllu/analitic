import { IsBoolean, IsDateString, IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class VentaTodasDto{
    @IsMongoId({each: true })
    empresa: string;

    @IsMongoId({each: true })
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
    fechaFin: string;

}