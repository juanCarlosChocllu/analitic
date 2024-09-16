import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { EstadoEnum } from '../enums/estado.enum';
import { Types } from 'mongoose';

export class informacionVentaDto {
  @IsMongoId()
  @IsOptional()
  tipoVenta: Types.ObjectId;

  @IsEnum(EstadoEnum)
  @IsOptional()
  estado: string;

  @IsDateString()
  fechaInicio: string;
  @IsDateString()
  fechaFin: string;
}
