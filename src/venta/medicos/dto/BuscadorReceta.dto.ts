import { IsDateString, IsNotEmpty } from 'class-validator';

export class BuscadorRecetaDto {
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;
}
