import { IsDateString } from "class-validator"

export class DescargarDto {
    @IsDateString()
    fechaInicio:string

    @IsDateString()
    fechaFin:string
}