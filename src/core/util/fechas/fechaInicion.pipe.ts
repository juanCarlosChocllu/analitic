import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isDateString } from 'class-validator';

@Injectable()
export class FechaInicioPipe implements PipeTransform<string> {
  transform(value: any) {

    if(!isDateString(value)){
      throw new BadRequestException(`fecha invalida: ${value}`);
  }
    return value;
  }
}
