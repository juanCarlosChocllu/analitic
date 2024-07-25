import { Controller, Get, Post, Body, Patch, Param, Delete, Type, Query, UseInterceptors } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaDto } from './dto/venta.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}


  @Post('actual')
   async actual(@Body() ventaDto:VentaDto) { 
     return await this.ventaService.findAll(ventaDto);
  }

  @Post('anterior')
  async anterio(@Body() ventaDto:VentaDto) { 
    return await this.ventaService.findAll(ventaDto);
 }
}
