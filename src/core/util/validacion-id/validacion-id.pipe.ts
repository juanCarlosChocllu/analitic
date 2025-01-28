import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isMongoId} from 'class-validator';
import { log } from 'node:console';

@Injectable()
export class ValidacionIdPipe implements PipeTransform<string> {
  transform(value: string) {
    if(!isMongoId(value)){
      throw new BadRequestException(`Id invalido: ${value}`);
    }
    return value;
  }
}
