import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { FechaDto } from './dto/fecha.dto';

@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  async allExcel(@Body()fechaDto:FechaDto) {     
    return  this.reporteService.allExcel(fechaDto);
  }


  @Post('verificacion')
  async informacionRestanteVenta(@Body()fechaDto:FechaDto) {   
    return  this.reporteService.informacionRestanteVenta(fechaDto);
  }
}
