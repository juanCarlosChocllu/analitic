import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator"
import { flag } from "../enums/flag.enum"
import { Types } from "mongoose"
export class VentaDto {

    @IsMongoId({each:true})
    sucursal:string[]
    @IsMongoId({each:true})
    tipoVenta:string[]
    @IsEnum(flag)
    flag:flag

    @IsOptional()
    @IsDateString()
    fechaInicio:string
    @IsOptional()
    @IsDateString()
    FechaFin:string   
}


export class VentaExcelDto {
    @IsMongoId()
    @IsOptional()
    empresa:string
    @IsMongoId({each:true})
    @IsOptional()
    sucursal:Types.ObjectId[]
    
    @IsOptional()
    @IsDateString()
    fechaInicio:string
    @IsOptional()
    @IsDateString()
    FechaFin:string   
}
