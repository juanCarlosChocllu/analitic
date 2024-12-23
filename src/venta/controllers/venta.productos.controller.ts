import { Body, Controller, Param, Post } from '@nestjs/common';
import { VentaProductosService } from '../services/venta.productos.service';
import { KpiDto } from '../dto/kpi.venta.dto';
import { ValidacionIdPipe } from 'src/util/validacion-id/validacion-id.pipe';
import { InformacionVentaDto } from '../dto/informacion.venta.dto';

@Controller('venta')
export class VentaProductosController {
    constructor ( private readonly ventaProductosService:VentaProductosService){}

    
 @Post('kpi/monturasvip')
 kpiMonturasPorEmpresa(@Body() kpiDto: KpiDto){


  return this.ventaProductosService.kpiMonturasPorEmpresa(kpiDto)
 }

 @Post('kpi/monturas')
 kipMonturas(@Body() kpiDto: KpiDto){


  return this.ventaProductosService.kpiMonturas(kpiDto)
 }

 

 @Post('kpi/monturas/informacion/:sucursal')
 kipMonturasInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:string ,@Body() informacionVentaDto: InformacionVentaDto){
  return this.ventaProductosService.kpiInformacionMonturas(informacionVentaDto, sucursal)
 }


 
 @Post('kpi/monturas/vip/:sucursal')
 kpiInformacionMonturasVip(@Param('sucursal', new ValidacionIdPipe) sucursal:string ,@Body() informacionVentaDto: InformacionVentaDto){
  return this.ventaProductosService.kpiInformacionMonturasVip(informacionVentaDto, sucursal)
 }

 @Post('kpi/lentes/contacto')
 kpiLentesDeContacto(@Body() kpiDto: KpiDto){
 return this.ventaProductosService.kpiLentesDeContacto(kpiDto)
}

@Post('kpi/lentes/contacto/informacion/:sucursal')
kpiIformacionLentesDeContacto( @Param ('sucursal', new ValidacionIdPipe) sucursal:string ,  @Body() informacionVentaDto: InformacionVentaDto){
return this.ventaProductosService.kpiIformacionLentesDeContacto(informacionVentaDto, sucursal)
}

@Post('kpi/gafas')
kipiGafas(@Body() kpiDto: KpiDto){
 return this.ventaProductosService.kpiGafas(kpiDto)
}

@Post('kpi/gafa/informacion/:sucursal')
kipGafaInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:string ,@Body() informacionVentaDto: InformacionVentaDto){
 return this.ventaProductosService.kpiInformacionGafa(informacionVentaDto, sucursal)
}


}
