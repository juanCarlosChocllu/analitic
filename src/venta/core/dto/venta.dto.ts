import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

import { Types } from 'mongoose';
import { EstadoEnum } from '../enums/estado.enum';


export class VentaDto {
  @IsMongoId()
  @IsOptional()
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

  @IsOptional()
  @IsBoolean()
   comisiona:boolean | null

  @IsDateString()
  fechaInicio: string;


  @IsDateString()
  fechaFin: string;
}
