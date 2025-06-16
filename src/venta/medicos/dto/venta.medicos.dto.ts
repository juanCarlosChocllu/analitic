import { IsOptional, IsString } from 'class-validator';
import { VentaDto } from 'src/venta/core/dto/venta.dto';
import { VentaTodasDto } from 'src/venta/core/dto/venta.todas.dto';

export class VentaMedicosDto extends VentaTodasDto {
  @IsOptional()
  @IsString()
  especialidad: string;

  @IsOptional()
  @IsString()
  medico: string;
}
