import { Controller,  Post, Body} from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { DescargarDto } from './dto/Descargar.dto';
import { Public } from 'src/autenticacion/decorators/public.decorator';

@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  async realizarDescarga(@Body()fechaDto:DescargarDto) {     
    return this.reporteService.realizarDescarga(fechaDto);
  }
  @Post('receta')
  async descargarReceta(@Body()fechaDto:DescargarDto) {     
    return this.reporteService.descargarReceta(fechaDto);
  }

  @Post('actualizar')
  async actualizarVentas(@Body()fechaDto:DescargarDto){
    return this.reporteService.actualizarVentas(fechaDto)
  }
  @Public()
    @Post('actualizar/fechas')
  async actualizarFechas(@Body()fechaDto:DescargarDto){
    return this.reporteService.actulizarFechas(fechaDto)
  }
}
