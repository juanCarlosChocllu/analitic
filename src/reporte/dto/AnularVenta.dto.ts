import { IsDateString, IsNotEmpty, IsString } from "class-validator"

export class AnularVentaDto{
    @IsString()
    @IsNotEmpty()
    idVenta:string

    @IsDateString()
    @IsNotEmpty()
    fechaAnulacion:string

    
     @IsString()
    @IsNotEmpty()
    estadoTracking:string

     @IsString()
    @IsNotEmpty()
    estado:string
}