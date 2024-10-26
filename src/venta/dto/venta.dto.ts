import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { flag } from '../enums/flag.enum';
import { Types } from 'mongoose';
import { EstadoEnum } from '../enums/estado.enum';
export class VentaDto {
  @IsMongoId({ each: true })
  sucursal: string[];
  @IsMongoId({ each: true })
  tipoVenta: string[];
  @IsEnum(flag)
  flag: flag;

  @IsOptional()
  @IsDateString()
  fechaInicio: string;
  @IsOptional()
  @IsDateString()
  FechaFin: string;
}

export class VentaExcelDto {
  @IsMongoId()
  empresa: string;

  @IsMongoId({ each: true })
  @IsOptional()
  sucursal: Types.ObjectId[];

  
  @IsMongoId({each:true})
  @IsOptional()
  tipoVenta: Types.ObjectId[];

  @IsEnum(EstadoEnum)
  @IsOptional()
  estado: string;


  @IsDateString()
  fechaInicio: string;


  @IsDateString()
  FechaFin: string;
}
