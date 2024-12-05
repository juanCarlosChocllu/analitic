import { Body, Controller, Post } from '@nestjs/common';
import { VentaMedicosService } from '../services/venta.medicos.service';
import { VentaExcelDto } from '../dto/venta.dto';
import { VentaMedicosDto } from '../dto/venta.medicos.dto';

@Controller('venta')
export class VentaMedicosController {
   constructor(
    private readonly ventaKpiMedicos: VentaMedicosService
   ){

   }
   
   @Post('medidas/oftalmologos')
   kpiOftalmologos(@Body () ventaMedicosDto:VentaMedicosDto){
    return this.ventaKpiMedicos.kpiOtalmologos(ventaMedicosDto)
 
   }
   @Post('medidas/optometra')
   kpiOptometras(@Body () ventaExcelDto:VentaExcelDto){
        return this.ventaKpiMedicos.kpiOptometras(ventaExcelDto)
   }
}
