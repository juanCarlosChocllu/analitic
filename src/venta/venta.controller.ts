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

  /* @Post('actual')
   async actual(@Body() ventaDto:VentaDto) { 
     return await this.ventaService.findAll(ventaDto);
  }
  @Post('anterior')
  async anterio(@Body() ventaDto:VentaDto) { 
    return await this.ventaService.findAll(ventaDto);
  }*/
  @Post('excel/actual')
  async ventaExcelActual(@Body() ventaDto: VentaExcelDto) {
    return await this.ventaService.ventaExel(ventaDto);
  }

  @Post('excel/anterior')
  async ventaExcelAnterior(@Body() ventaDto: VentaExcelDto) {
    return await this.ventaService.ventaExel(ventaDto);
  }



  @Get('Empresa')
  async empresaExcel() {
    return await this.ventaService.EmpresaExcel();
  }

  @Get('sucursalExcel/:id')
  async sucursalExcel(@Param() id: string) {
    return await this.ventaService.sucursalExcel(id);
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
  

  @Get('finalizar')
  finalizarVenta() {
    return this.ventaService.finalizarVentas();
  }
}
