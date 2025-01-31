import { IsMongoId, IsOptional, ValidateIf } from "class-validator";
import { Types } from "mongoose";
import { PaginadorCoreDto } from "src/core/dto/PaginadorCoreDto";

export class BuscadorMetasDto extends PaginadorCoreDto {
    
    @IsMongoId()
    @IsOptional()
    sucursal:Types.ObjectId



    @IsMongoId()
    @IsOptional()
    @ValidateIf((i:BuscadorMetasDto) => !i.fechaFin )
    fechaInicio:string

    @IsMongoId()
    @IsOptional()
    @ValidateIf((i:BuscadorMetasDto) => !i.fechaInicio )
    fechaFin:string

    @IsMongoId()
    @IsOptional()
    @ValidateIf((i:BuscadorMetasDto) => !i.fechaMetaFin )
    fechaMetaInicio:string

    @IsMongoId()
    @IsOptional()
    @ValidateIf((i:BuscadorMetasDto) => !i.fechaMetaInicio )
    fechaMetaFin:string
}