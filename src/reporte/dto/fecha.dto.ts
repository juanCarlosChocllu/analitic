import { IsDateString } from "class-validator"

export class FechaDto{
    @IsDateString()
    fechaInicio:string

    @IsDateString()
    fechaFin:string

}