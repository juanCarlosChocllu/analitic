import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { DescargarDto } from './dto/Descargar.dto';

@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  async realizarDescarga(@Body()fechaDto:DescargarDto) {     
    return  this.reporteService.realizarDescarga(fechaDto);
  }
}
