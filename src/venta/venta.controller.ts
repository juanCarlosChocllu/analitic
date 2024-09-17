import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Type,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaDto, VentaExcelDto } from './dto/venta.dto';
import { VentaExcel } from './schemas/venta.schema';
import { informacionVentaDto } from './dto/informacion.venta.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post('excel/actual')
  async ventaExcelActual(@Body() ventaDto: VentaExcelDto) {
    return await this.ventaService.ventaExel(ventaDto);
  }

  @Post('excel/anterior')
  async ventaExcelAnterior(@Body() ventaDto: VentaExcelDto) {
    return await this.ventaService.ventaExel(ventaDto);
  }




 

  @Post('excel/sucursal/asesor')
  async ventaSucursalExcelActual(@Body() ventaDto: VentaExcelDto) {
    return await this.ventaService.ventaSucursalExcel(ventaDto);
  }

  @Post('excel/gestion')
  async gestionExcel(@Body() ventaDto: VentaExcelDto) {
    return await this.ventaService.gestionExcel(ventaDto);
  }

 

  @Post('informacion/:id')
  sucursalVentaInformacion(
    @Param('id') id: string,
    @Body() informacionVentaDto: informacionVentaDto,
  ) {
    return this.ventaService.sucursalVentaInformacion(id, informacionVentaDto);
  }

  @Post('lente/:id')
  informacionLente(@Param('id') id: string,
  @Body() informacionVentaDto: informacionVentaDto,){
     return this.ventaService.informacionLente( id,informacionVentaDto)
  }
  
  @Post('indicadores/dia')
   indicadoresPorFecha(@Body() ventaDto: VentaExcelDto){
    return this.ventaService.indicadoresPorFecha(ventaDto)
   }

  @Get('finalizar')
  finalizarVenta() {
    return this.ventaService.finalizarVentas();
  }
}
