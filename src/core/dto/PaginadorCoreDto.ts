import { IsNumber, IsNumberString, IsOptional } from "class-validator"

export class PaginadorCoreDto {

    @IsOptional()
    @IsNumberString()
    limite:string = '20'

    @IsNumberString()
    @IsOptional()
    pagina:string ='1'

}