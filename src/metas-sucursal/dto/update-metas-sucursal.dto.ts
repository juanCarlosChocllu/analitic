import { PartialType } from '@nestjs/swagger';
import { CreateMetasSucursalDto } from './create-metas-sucursal.dto';

export class UpdateMetasSucursalDto extends PartialType(CreateMetasSucursalDto) {}
