import { Body, Controller, Param, Post } from "@nestjs/common";
import { VentaAsesoresService } from "../service/ventaAsesores.service";
import { ValidacionIdPipe } from "src/core/util/validacion-id/validacion-id.pipe";
import { InformacionVentaDto } from "src/venta/core/dto/informacion.venta.dto";
import { VentaDto } from "src/venta/core/dto/venta.dto";
import { VentaTodasDto } from "src/venta/core/dto/venta.todas.dto";

@Controller('gestion')
export class VentaAsesoresController {
    constructor ( private readonly ventaAsesoresService:VentaAsesoresService){}
          @Post('excel/indicadores/asesor')
            async indicadoresPorAsesor(@Body() ventaDto: VentaDto) {
                
              return await this.ventaAsesoresService.indicadoresPorAsesor(ventaDto);
            }
          
            @Post('excel/indicadores/sucursal')
            async indicadoresPorSucursal(@Body() ventaTodasDto: VentaTodasDto) {   
              return await this.ventaAsesoresService.indicadoresPorSucursal(ventaTodasDto);
            }
        
            @Post('informacion/:id')
            sucursalVentaInformacion(
              @Param('id', ValidacionIdPipe) id: string,
              @Body() informacionVentaDto: InformacionVentaDto,
            ) {
                  return this.ventaAsesoresService.sucursalVentaInformacion(id, informacionVentaDto);
            }

            @Post('indicadores/fecha')
            indicadoresPorFecha(@Body() ventaDto: VentaDto){
             return this.ventaAsesoresService.indicadoresPorFecha(ventaDto)
            }
}