import { Body, Controller, Param, Post } from '@nestjs/common';
import { VentaLenteService } from '../services/venta.lente.service';

import { InformacionVentaDto } from '../../core/dto/informacion.venta.dto';
import { VentaTodasDto } from '../../core/dto/venta.todas.dto';
import { InformacionEmpresasTodasVentaDto } from '../../core/dto/informacion.empresas.todas.dto';
import { ValidacionIdPipe } from 'src/core/util/validacion-id/validacion-id.pipe';
import { VentaDto } from 'src/venta/core/dto/venta.dto';

@Controller('venta')
export class VentaLenteController {
    constructor(    private readonly ventaLenteService: VentaLenteService,){}



 @Post('kpi/material')
  kpiMaterial(@Body() kpiDto: VentaDto){
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
kpiLentes(@Body() kpiEmpresaDto: VentaTodasDto){    
return this.ventaLenteService.kpiEmpresas(kpiEmpresaDto)
}

}
