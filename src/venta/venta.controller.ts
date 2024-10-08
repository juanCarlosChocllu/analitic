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
import { KpiDto } from './dto/kpi.venta.dto';

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
    console.log(ventaDto);
    
    return await this.ventaService.ventaSucursalExcel(ventaDto);
  }

  @Post('excel/gestion')
  async gestionExcel(@Body() ventaDto: VentaExcelDto) {
    console.log(ventaDto);
    
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

   @Post('kpi')
    kpi(@Body() kpiDto: KpiDto){
    return this.ventaService.kpi(kpiDto)
   }

   @Post('kpi/lc/econovision')
   kpiLentesDeContactoEconoVision(@Body() kpiDto: KpiDto){
   return this.ventaService.kpiLentesDeContactoEconoVision(kpiDto)
  }

  @Post('kpi/lc/opticentro')
  kpiLentesDeContactoOpticentro(@Body() kpiDto: KpiDto){
  return this.ventaService.kpiLentesDeContactoOpticentro(kpiDto)
 }
   @Post('kpi/monturas/opticentro/vip')
    kpiMonturasVip(@Body() kpiDto: KpiDto){
    return this.ventaService.kpiMonturasVip(kpiDto)
   }
   @Post('kpi/lc/tuOptica')
   kpiLentesDeContactoTuOptica(@Body() kpiDto: KpiDto){
   return this.ventaService.kpiLentesDeContactoTuOptica(kpiDto)
  }
  @Get('finalizar')
  finalizarVenta() {
    return this.ventaService.finalizarVentas();
  }



}
