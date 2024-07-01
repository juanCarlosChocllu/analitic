import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoVentaDto } from './create-tipo-venta.dto';

export class UpdateTipoVentaDto extends PartialType(CreateTipoVentaDto) {}
