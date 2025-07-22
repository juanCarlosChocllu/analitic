import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { FlagVentaE } from '../enums/estado.enum';
import { Types } from 'mongoose';

export class DetalleVentaFilter {

  @IsMongoId({each:true})
  empresa: Types.ObjectId[];

  @IsMongoId({each:true})
  @IsOptional()
  tipoVenta: Types.ObjectId[];

  @IsEnum(FlagVentaE)
  flagVenta: string;

  
  @IsOptional()
  @IsBoolean()
  comisiona:boolean | null

  @IsDateString()
  fechaInicio: string;
  
  @IsDateString()
  fechaFin: string;
}
