import { PartialType } from '@nestjs/swagger';
import { CreateDiaDto } from './create-dia.dto';

export class UpdateDiaDto extends PartialType(CreateDiaDto) {}
