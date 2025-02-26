import { IsDateString, IsNotEmpty, IsString } from "class-validator"

export class finalizarVentaDto {
    
    @IsString()
    @IsNotEmpty()
    idVenta:string

    @IsDateString()
    @IsNotEmpty()
    fecha:string
}