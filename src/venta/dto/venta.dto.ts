import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator"
import { flag } from "../enums/flag.enum"
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
    @IsString({each:true})
    sucursal:string[]
    @IsOptional()
    @IsDateString()
    fechaInicio:string
    @IsOptional()
    @IsDateString()
    FechaFin:string   
}
