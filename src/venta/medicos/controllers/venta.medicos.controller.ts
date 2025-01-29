import { Body, Controller, Post } from '@nestjs/common';
import { VentaMedicosService } from '../services/venta.medicos.service';
import { VentaExcelDto } from '../../dto/venta.dto';
import { VentaMedicosDto } from '../../dto/venta.medicos.dto';

@Controller('venta')
export class VentaMedicosController {
   constructor(
    private readonly ventaKpiMedicos: VentaMedicosService
   ){

   }
   
  
   @Post('recetas/actual/medicos')
   kpiMedicosActual(@Body () ventaMedicosDto:VentaMedicosDto){      
        return this.ventaKpiMedicos.kpiMedicos(ventaMedicosDto)
   }

   @Post('recetas/anterior/medicos')
   kpiMedicosAterior(@Body () ventaMedicosDto:VentaMedicosDto){
        return this.ventaKpiMedicos.kpiMedicos(ventaMedicosDto)
   }
}
