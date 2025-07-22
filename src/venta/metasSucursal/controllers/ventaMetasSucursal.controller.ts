import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { VentaMetasSucursalService } from "../services/VentaMetasSucursal.service";
import { VentaDto } from "src/venta/core/dto/venta.dto";
import { VentaTodasDto } from "src/venta/core/dto/venta.todas.dto";
import { EstadoVentaE } from "src/venta/core/enums/estado.enum";
import { DetalleVentaMetaDto } from "../dto/DetalleVentaMeta.dto";
import { Public } from "src/autenticacion/decorators/public.decorator";
import { ValidacionIdPipe } from "src/core/util/validacion-id/validacion-id.pipe";
import { Types } from "mongoose";
import { InformacionVentaDto } from "src/venta/core/dto/informacion.venta.dto";


@Controller('venta/meta/sucursal')
export class VentaMestasSucursalController  {
    constructor(private readonly ventaMetasSucursalService:VentaMetasSucursalService){}
    @Post('actual')
    public metasDeVentaActual(@Body() ventaTodasDto:VentaTodasDto){
        return  this.ventaMetasSucursalService.metasDeVenta(ventaTodasDto)
    }

    @Post('anterior')
    public metasDeVentaAnterior(@Body() ventaTodasDto:VentaTodasDto){
        return  this.ventaMetasSucursalService.metasDeVenta(ventaTodasDto)
    }
    @Public()
    @Post('detalle/:sucursal')
    public detalleVentaMetas(@Param('sucursal', new ValidacionIdPipe()) sucursal:Types.ObjectId,@Body() detalleVentaMetaDto:InformacionVentaDto){
        return this.ventaMetasSucursalService.detalleVentaMetas(detalleVentaMetaDto, sucursal)

    }

}