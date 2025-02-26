import {
  Controller,

} from '@nestjs/common';
import { AbonoService } from './abono.service';

@Controller('abono')
export class AbonoController {
  constructor(private readonly abonoService: AbonoService) {}

}
