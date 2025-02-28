import { IsDateString, IsNotEmpty, IsString } from "class-validator"

export class FinalizarVentaDto {
    
    @IsString()
    @IsNotEmpty()
    idVenta:string


    @IsString()
    @IsNotEmpty()
    tracking:string

    @IsString()
    @IsNotEmpty()
    flag:string


    @IsDateString()
    @IsNotEmpty()
    fecha:string
}