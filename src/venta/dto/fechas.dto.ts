import { IsDateString } from "class-validator"



export class FechasDto{
    @IsDateString()
    fechaInicio:string
    @IsDateString()
    fechaFin:string
}