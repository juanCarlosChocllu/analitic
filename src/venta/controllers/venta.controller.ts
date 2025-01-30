import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { VentaService } from '../services/venta.service';
import { VentaDto } from '../dto/venta.dto';
@Controller('venta')
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
  ) {}
  @Post('excel/actual')
  async ventaExcelActual(@Body() ventaDto: VentaDto) {
    return await this.ventaService.ventaExel(ventaDto);
  }

  @Post('excel/anterior')
  async ventaExcelAnterior(@Body() ventaDto: VentaDto) {    
    return await this.ventaService.ventaExel(ventaDto);
  }
  @Get('finalizar')
  finalizarVenta() {
    return this.ventaService.finalizarVentas();
  }




  




}
