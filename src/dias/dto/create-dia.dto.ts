import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator";
import { DiaDto } from "./diaData.dto";
import { Type } from "class-transformer";

export class CreateDiaDto {

    @IsNotEmpty()
    @IsString()
    nombre:string

    @IsNotEmpty()
    @IsString()
    tipo:string

    @IsArray()
    @ValidateNested({each:true})
    @Type(() => DiaDto)
    data:DiaDto[]

}
