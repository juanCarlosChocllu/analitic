import { Body, Controller ,Param,Post} from '@nestjs/common';
import { VentaGestionService } from '../services/venta.gestion.service';
import { VentaExcelDto } from '../dto/venta.dto';
import { InformacionVentaDto } from '../dto/informacion.venta.dto';
import { ValidacionIdPipe } from 'src/core/util/validacion-id/validacion-id.pipe';

@Controller('gestion')
export class VentaGestionController {
    constructor(
        private readonly ventaGestionService: VentaGestionService,
    ){}
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
      @Param('id', ValidacionIdPipe) id: string,
      @Body() informacionVentaDto: InformacionVentaDto,
    ) {
          return this.ventaGestionService.sucursalVentaInformacion(id, informacionVentaDto);
    }
    @Post('indicadores/fecha')
    indicadoresPorFecha(@Body() ventaDto: VentaExcelDto){
     return this.ventaGestionService.indicadoresPorFecha(ventaDto)
    }
  
}
