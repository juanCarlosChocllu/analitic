import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaExcelDto } from './dto/venta.dto';

import { InformacionVentaDto } from './dto/informacion.venta.dto';
import { KpiDto } from './dto/kpi.venta.dto';
import { ValidacionIdPipe } from 'src/util/validacion-id/validacion-id.pipe';

import { VentaKpiService } from './venta.kpi.service';

import { TokenGuard } from 'src/autenticacion/guard/token/token.guard';
import { VentaGestionService } from './venta.gestion.service';

@UseGuards(TokenGuard)
@Controller('venta')
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    private readonly ventaKpiService: VentaKpiService,
    private readonly ventaGestionService: VentaGestionService
  
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
      
    return await this.ventaGestionService.indicadoresPorAsesor(ventaDto);
  }

  @Post('excel/indicadores/sucursal')
  async indicadoresPorSucursal(@Body() ventaDto: VentaExcelDto) {   
    return await this.ventaGestionService.indicadoresPorSucursal(ventaDto);
  }

 

  @Post('informacion/:id')
  sucursalVentaInformacion(
    @Param('id') id: string,
    @Body() informacionVentaDto: InformacionVentaDto,
  ) {
    return this.ventaGestionService.sucursalVentaInformacion(id, informacionVentaDto);
  }

  @Post('lente/:id')
  informacionLente(@Param('id') id: string,
  @Body() informacionVentaDto: InformacionVentaDto,){
     return this.ventaService.informacionLente( id,informacionVentaDto)
  }
  
  @Post('indicadores/fecha')
   indicadoresPorFecha(@Body() ventaDto: VentaExcelDto){
    return this.ventaGestionService.indicadoresPorFecha(ventaDto)
   }

   @Post('kpi/lentes')
    kpi(@Body() kpiDto: KpiDto){    
    return this.ventaKpiService.kpi(kpiDto)
   }

   
   @Post('kpi/material')
    kpiMaterial(@Body() kpiDto: KpiDto){
    return this.ventaKpiService.kpiMaterial(kpiDto)
   }



   @Post('kpi/monturasvip')
   kpiMonturasPorEmpresa(@Body() kpiDto: KpiDto){


    return this.ventaKpiService.kpiMonturasPorEmpresa(kpiDto)
   }

   @Post('kpi/monturas')
   kipMonturas(@Body() kpiDto: KpiDto){


    return this.ventaKpiService.kpiMonturas(kpiDto)
   }

   

   @Post('kpi/monturas/informacion/:sucursal')
   kipMonturasInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:string ,@Body() informacionVentaDto: InformacionVentaDto){
    return this.ventaKpiService.kpiInformacionMonturas(informacionVentaDto, sucursal)
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


  //-----------------rutas gafas
  
  @Post('kpi/gafas')
  kipiGafas(@Body() kpiDto: KpiDto){
   return this.ventaKpiService.kpiGafas(kpiDto)
  }

  @Post('kpi/gafa/informacion/:sucursal')
  kipGafaInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:string ,@Body() informacionVentaDto: InformacionVentaDto){
   return this.ventaKpiService.kpiInformacionGafa(informacionVentaDto, sucursal)
  }


  




}
