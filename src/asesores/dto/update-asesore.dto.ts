import { PartialType } from '@nestjs/mapped-types';
import { CreateAsesoreDto } from './create-asesore.dto';

export class UpdateAsesoreDto extends PartialType(CreateAsesoreDto) {}
