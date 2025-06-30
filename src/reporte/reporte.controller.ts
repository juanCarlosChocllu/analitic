import { Controller,  Post, Body} from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { DescargarDto } from './dto/Descargar.dto';
import { Public } from 'src/autenticacion/decorators/public.decorator';

@Controller('reporte')
export class ReporteController {
  constructor(private readonly reporteService: ReporteService) {}

  @Post()
  @Public()
  async realizarDescarga(@Body()fechaDto:DescargarDto) {     
    return this.reporteService.realizarDescarga(fechaDto);
  }

  @Post('receta')
  @Public()
  async descargarReceta(@Body()fechaDto:DescargarDto) {     
    return this.reporteService.descargarReceta(fechaDto);
  }
}
