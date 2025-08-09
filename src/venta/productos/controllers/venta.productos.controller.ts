import { Body, Controller, Param, Post } from '@nestjs/common';
import { VentaProductosService } from '../services/venta.productos.service';


import { InformacionVentaDto } from '../../core/dto/informacion.venta.dto';
import { ValidacionIdPipe } from 'src/core/util/validacion-id/validacion-id.pipe';
import { VentaDto } from 'src/venta/core/dto/venta.dto';
import { Types } from 'mongoose';

@Controller('venta')
export class VentaProductosController {
    constructor ( private readonly ventaProductosService:VentaProductosService){}

    
 @Post('kpi/monturasvip')
 kpiMonturasPorEmpresa(@Body() kpiDto: VentaDto){


  return this.ventaProductosService.kpiMonturasVipOpticentro(kpiDto)
 }

 @Post('kpi/monturas')
 kipMonturas(@Body() kpiDto: VentaDto){


  return this.ventaProductosService.kpiMonturas(kpiDto)
 }

 

 @Post('kpi/monturas/informacion/:sucursal')
 kipMonturasInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:Types.ObjectId ,@Body() informacionVentaDto: InformacionVentaDto){
  return this.ventaProductosService.kpiInformacionMonturas(informacionVentaDto, sucursal)
 }


 
 @Post('kpi/monturas/vip/:sucursal')
 kpiInformacionMonturasVip(@Param('sucursal', new ValidacionIdPipe) sucursal:Types.ObjectId ,@Body() informacionVentaDto: InformacionVentaDto){
  return this.ventaProductosService.kpiInformacionMonturasVip(informacionVentaDto, sucursal)
 }

 @Post('kpi/lentes/contacto')
 kpiLentesDeContacto(@Body() kpiDto: VentaDto){
 return this.ventaProductosService.kpiLentesDeContacto(kpiDto)
}

@Post('kpi/lentes/contacto/informacion/:sucursal')
kpiIformacionLentesDeContacto( @Param ('sucursal', new ValidacionIdPipe) sucursal:Types.ObjectId ,  @Body() informacionVentaDto: InformacionVentaDto){
return this.ventaProductosService.kpiIformacionLentesDeContacto(informacionVentaDto, sucursal)
}

@Post('kpi/gafas')
kipiGafas(@Body() kpiDto: VentaDto){
 return this.ventaProductosService.kpiGafas(kpiDto)
}

@Post('kpi/gafa/informacion/:sucursal')
kipGafaInformacion(@Param('sucursal', new ValidacionIdPipe) sucursal:Types.ObjectId ,@Body() informacionVentaDto: InformacionVentaDto){
 return this.ventaProductosService.kpiInformacionGafa(informacionVentaDto, sucursal)
}


}
