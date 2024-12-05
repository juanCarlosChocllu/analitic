import { IsDateString, IsMongoId, IsNotEmpty } from "class-validator";

export class VentaMedicosDto{
    @IsMongoId({each:true})
    @IsNotEmpty()
    oftalmologos:string[]=[]

    @IsDateString()
    @IsNotEmpty()
    fechaInicio:string
    @IsNotEmpty()
    @IsDateString()
    fechaFin:string
}