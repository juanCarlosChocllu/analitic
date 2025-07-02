import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { VentaService } from '../services/venta.service';
import { VentaDto } from '../core/dto/venta.dto';
import { FinalizarVentaDto } from '../core/dto/FinalizarVenta.dto';
import { Public } from 'src/autenticacion/decorators/public.decorator';
import { VentaTodasDto } from '../core/dto/venta.todas.dto';
@Controller('venta')
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
  ) {}
  @Post('excel/actual')
  async ventaExcelActual(@Body() ventaTodasDto: VentaTodasDto) {
    return await this.ventaService.ventas(ventaTodasDto);
  }

  @Post('excel/anterior')
  async ventaExcelAnterior(@Body() ventaTodasDto: VentaTodasDto) {    
    return await this.ventaService.ventas(ventaTodasDto);
  }
  @Public()
  @Post('finalizar')
   async finalizarVentas(@Body() finalizarVentaDto: FinalizarVentaDto){
    return this.ventaService.finalizarVentas(finalizarVentaDto)
   }


 

}
