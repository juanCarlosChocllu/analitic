import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isDateString } from 'class-validator';

@Injectable()
export class FechaFinPipe implements PipeTransform<string> {
  transform(value: string) {

    if(!isDateString(value)){
        throw new BadRequestException(`fecha invalida: ${value}`);
    }
    return value;
  }
}
