import { PartialType } from '@nestjs/swagger';
import { CreateOftalmologoDto } from './create-oftalmologo.dto';

export class UpdateOftalmologoDto extends PartialType(CreateOftalmologoDto) {}
