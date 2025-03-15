import { Transform } from "class-transformer";
import { IsString } from "class-validator";

export class BuscadorMedicoDto{
    @IsString()
        @Transform(({value}:{value:string})=> value.trim())
        oftalmologo:string
    
}