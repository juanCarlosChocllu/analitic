import { IsString } from "class-validator";

export class BuscarOftalmologoDto{
    @IsString()
    oftalmologo:string

}