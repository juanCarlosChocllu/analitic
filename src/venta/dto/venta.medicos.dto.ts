import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { VentaDto } from "./venta.dto";

export class VentaMedicosDto extends VentaDto{

    @IsOptional()
    @IsString()
    especialidad:string

} 