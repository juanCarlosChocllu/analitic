import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { VentaExcelDto } from "./venta.dto";

export class VentaMedicosDto extends VentaExcelDto{

    @IsOptional()
    @IsString()
    especialidad:string

} 