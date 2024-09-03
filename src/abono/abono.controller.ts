import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AbonoService } from './abono.service';

@Controller('abono')
export class AbonoController {
  constructor(private readonly abonoService: AbonoService) {}

  @Post('reporte')
  extraerAbono() {
    return this.abonoService.extraerAbono();
  }


}
