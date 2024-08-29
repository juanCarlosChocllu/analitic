import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HttpAbonoService } from './abono.service';

@Controller('abono')
export class AbonoController {
  constructor(private readonly httpAbonoService: HttpAbonoService) {}

  @Post('reporte')
  extraerAbono() {
    return this.httpAbonoService.extraerAbono();
  }


}
