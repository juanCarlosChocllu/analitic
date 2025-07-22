import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { FlagVentaE } from "src/venta/core/enums/estado.enum";

export class DetalleVentaMetaDto{


    @IsOptional()
    @IsBoolean()
    comisiona: boolean | null;

    @IsMongoId({ each: true })
    @IsOptional()
    tipoVenta: Types.ObjectId[];

    @IsMongoId()
    sucursal:Types.ObjectId

    @IsDateString()
    fechaInicio: string;
    
    @IsDateString()
    fechaFin: string;
    
    @IsEnum(FlagVentaE)
    @IsNotEmpty()
    flagVenta: string;
    

}