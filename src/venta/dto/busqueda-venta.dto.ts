
import { IsDateString, IsMongoId, IsOptional } from "class-validator"
import { Types } from "mongoose"

export class BusquedaVentaDto{
    @IsOptional()
    @IsMongoId()
    tipoVenta:Types.ObjectId

    @IsOptional()
    @IsDateString()
    fechaInicio:Date

    @IsOptional()
    @IsDateString()
    fechaFin:Date

}