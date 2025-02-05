import { Body, Controller, Get, Post } from "@nestjs/common";
import { VentaMetasSucursalService } from "../services/VentaMetasSucursal.service";
import { VentaDto } from "src/venta/core/dto/venta.dto";
import { VentaTodasDto } from "src/venta/core/dto/venta.todas.dto";


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

}