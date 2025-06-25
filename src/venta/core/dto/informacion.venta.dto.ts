import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { EstadoVentaE, FlagVentaE } from '../enums/estado.enum';
import { Types } from 'mongoose';


export class InformacionVentaDto {

  @IsMongoId({each:true})
  @IsOptional()
  tipoVenta: Types.ObjectId[];


  @IsOptional()
  @IsBoolean()
  comisiona:boolean | null

  @IsDateString()
  fechaInicio: string;
  
  @IsDateString()
  fechaFin: string;

  @IsEnum(FlagVentaE  )
  @IsNotEmpty()
  flagVenta:string
}
