import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { Types } from 'mongoose';
import { EstadoVentaE, FlagVentaE } from '../enums/estado.enum';

export class VentaDto {
  @IsMongoId()
  @IsOptional()
  empresa: string;

  @IsMongoId({ each: true })
  @IsOptional()
  sucursal: Types.ObjectId[];

  @IsMongoId({ each: true })
  @IsOptional()
  tipoVenta: Types.ObjectId[];

  @IsEnum(FlagVentaE)
  @IsNotEmpty()
  flagVenta: string;

  @IsOptional()
  @IsBoolean()
  comisiona: boolean | null;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;
}
