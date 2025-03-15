import { PartialType } from '@nestjs/swagger';
import { CreateColorLenteDto } from './create-color-lente.dto';

export class UpdateColorLenteDto extends PartialType(CreateColorLenteDto) {}
