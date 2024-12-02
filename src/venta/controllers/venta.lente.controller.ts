import { Body, Controller, Param, Post } from '@nestjs/common';
import { VentaLenteService } from '../services/venta.lente.service';
import { KpiDto } from '../dto/kpi.venta.dto';
import { ValidacionIdPipe } from 'src/util/validacion-id/validacion-id.pipe';
import { InformacionVentaDto } from '../dto/informacion.venta.dto';

@Controller('venta')
export class VentaLenteController {
    constructor(    private readonly ventaLenteService: VentaLenteService,){}


  @Post('kpi/lentes')
  kpi(@Body() kpiDto: KpiDto){    
  return this.ventaLenteService.kpi(kpiDto)
 }

 
 @Post('kpi/material')
  kpiMaterial(@Body() kpiDto: KpiDto){
  return this.ventaLenteService.kpiMaterial(kpiDto)
 }

@Post('kpi/informacion/:sucursal')
kpiInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:string,
    @Body() informacionVentaDto :InformacionVentaDto
 ){
  return this.ventaLenteService.kpiInformacion(sucursal, informacionVentaDto)
}
}
