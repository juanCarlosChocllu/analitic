import { Body, Controller, Post } from '@nestjs/common';
import { VentaMedicosService } from '../services/venta.medicos.service';
import { VentaMedicosDto } from '../dto/venta.medicos.dto';
import { EstadoVentaE } from 'src/venta/core/enums/estado.enum';

@Controller('venta')
export class VentaMedicosController {
   constructor(
    private readonly ventaKpiMedicos: VentaMedicosService
   ){

   }
   
  
   @Post('recetas/actual/medicos')
   kpiMedicosActual(@Body () ventaMedicosDto:VentaMedicosDto){      
        return this.ventaKpiMedicos.kpiMedicos(ventaMedicosDto, EstadoVentaE.ACTUAL)
   }

   @Post('recetas/anterior/medicos')
   kpiMedicosAterior(@Body () ventaMedicosDto:VentaMedicosDto){
        return this.ventaKpiMedicos.kpiMedicos(ventaMedicosDto,EstadoVentaE.ANTERIOR)
   }
}
