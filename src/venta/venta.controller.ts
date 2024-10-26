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
  UseGuards,
} from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaDto, VentaExcelDto } from './dto/venta.dto';
import { VentaExcel } from './schemas/venta.schema';
import { InformacionVentaDto } from './dto/informacion.venta.dto';
import { KpiDto } from './dto/kpi.venta.dto';
import { ValidacionIdPipe } from 'src/util/validacion-id/validacion-id.pipe';
import { FechaFinPipe } from 'src/util/fechas/fechaFin.pipe';
import { FechaInicioPipe } from 'src/util/fechas/fechaInicion.pipe';
import { VentaKpiService } from './venta.kpi.service';
import { TipoVenta } from 'src/tipo-venta/schemas/tipo-venta.schema';
import { log } from 'node:console';
import { TokenGuard } from 'src/autenticacion/guard/token/token.guard';

@UseGuards(TokenGuard)
@Controller('venta')
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    private readonly ventaKpiService: VentaKpiService
  
  ) {}

  @Post('excel/actual')
  async ventaExcelActual(@Body() ventaDto: VentaExcelDto) {
    return await this.ventaService.ventaExel(ventaDto);
  }

  @Post('excel/anterior')
  async ventaExcelAnterior(@Body() ventaDto: VentaExcelDto) {    
    return await this.ventaService.ventaExel(ventaDto);
  }




 

  @Post('excel/indicadores/asesor')
  async indicadoresPorAsesor(@Body() ventaDto: VentaExcelDto) {
      
    return await this.ventaService.indicadoresPorAsesor(ventaDto);
  }

  @Post('excel/indicadores/sucursal')
  async indicadoresPorSucursal(@Body() ventaDto: VentaExcelDto) {   
    return await this.ventaService.indicadoresPorSucursal(ventaDto);
  }

 

  @Post('informacion/:id')
  sucursalVentaInformacion(
    @Param('id') id: string,
    @Body() informacionVentaDto: InformacionVentaDto,
  ) {
    return this.ventaService.sucursalVentaInformacion(id, informacionVentaDto);
  }

  @Post('lente/:id')
  informacionLente(@Param('id') id: string,
  @Body() informacionVentaDto: InformacionVentaDto,){
     return this.ventaService.informacionLente( id,informacionVentaDto)
  }
  
  @Post('indicadores/fecha')
   indicadoresPorFecha(@Body() ventaDto: VentaExcelDto){
    return this.ventaService.indicadoresPorFecha(ventaDto)
   }

   @Post('kpi/lentes')
    kpi(@Body() kpiDto: KpiDto){    
    return this.ventaKpiService.kpi(kpiDto)
   }

   
   @Post('kpi/material')
    kpiMaterial(@Body() kpiDto: KpiDto){
    return this.ventaKpiService.kpiMaterial(kpiDto)
   }



   @Post('kpi/monturas')
   kpiMonturasPorEmpresa(@Body() kpiDto: KpiDto){
    console.log('hola');
    
    return this.ventaKpiService.kpiMonturasPorEmpresa(kpiDto)
   }

   
   @Post('kpi/monturas/vip/:sucursal')
   kpiInformacionMonturasVip(@Param('sucursal', new ValidacionIdPipe) sucursal:string ,@Body() informacionVentaDto: InformacionVentaDto){
    return this.ventaKpiService.kpiInformacionMonturasVip(informacionVentaDto, sucursal)
   }

   @Post('kpi/lentes/contacto')
   kpiLentesDeContacto(@Body() kpiDto: KpiDto){
   return this.ventaKpiService.kpiLentesDeContacto(kpiDto)
  }

  @Post('kpi/lentes/contacto/informacion/:sucursal')
  kpiIformacionLentesDeContacto( @Param ('sucursal', new ValidacionIdPipe) sucursal:string ,  @Body() informacionVentaDto: InformacionVentaDto){
  return this.ventaKpiService.kpiIformacionLentesDeContacto(informacionVentaDto, sucursal)
 }



  @Post('kpi/informacion/:sucursal')
  kpiInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:string,
      @Body() informacionVentaDto :InformacionVentaDto
   ){
    return this.ventaKpiService.kpiInformacion(sucursal, informacionVentaDto)
  }

  @Get('finalizar')
  finalizarVenta() {
    return this.ventaService.finalizarVentas();
  }



}
