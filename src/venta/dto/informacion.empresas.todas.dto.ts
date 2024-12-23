import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { EstadoEnum } from '../enums/estado.enum';
import { Types } from 'mongoose';

export class InformacionEmpresasTodasVentaDto {

  @IsMongoId({each:true})
  empresa: Types.ObjectId[];
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
