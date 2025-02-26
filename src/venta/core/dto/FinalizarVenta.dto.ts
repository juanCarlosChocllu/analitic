import { IsDateString, IsNotEmpty, IsString } from "class-validator"

export class FinalizarVentaDto {
    
    @IsString()
    @IsNotEmpty()
    idVenta:string

    @IsDateString()
    @IsNotEmpty()
    fecha:string
}