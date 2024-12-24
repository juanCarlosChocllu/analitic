import { Body, Controller, Param, Post } from '@nestjs/common';
import { VentaLenteService } from '../services/venta.lente.service';
import { KpiDto } from '../dto/kpi.venta.dto';
import { ValidacionIdPipe } from 'src/util/validacion-id/validacion-id.pipe';
import { InformacionVentaDto } from '../dto/informacion.venta.dto';
import { KpiEmpresaDto } from '../dto/kpi.venta.empresas.dto';
import { InformacionEmpresasTodasVentaDto } from '../dto/informacion.empresas.todas.dto';

@Controller('venta')
export class VentaLenteController {
    constructor(    private readonly ventaLenteService: VentaLenteService,){}



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


@Post('kpi/informacion/empresa/:empresa')
kpiInformacionEmpresa(@Param('empresa', new ValidacionIdPipe) sucursal:string,
    @Body() informacionVentaDto :InformacionVentaDto
 ){
  return this.ventaLenteService.kpiInformacionEmpresa(sucursal, informacionVentaDto)
}

@Post('kpi/informacion/empresas/todas')
informacionTodasEmpresas(
    @Body() InformacionEmpresasTodasVentaDto :InformacionEmpresasTodasVentaDto
 ){  
  return this.ventaLenteService.kpiInformacionTodasEmpresas(InformacionEmpresasTodasVentaDto)
}


@Post('kpi/empresas/lentes')
kpiLentes(@Body() kpiEmpresaDto: KpiEmpresaDto){    
return this.ventaLenteService.kpiEmpresas(kpiEmpresaDto)
}

}
