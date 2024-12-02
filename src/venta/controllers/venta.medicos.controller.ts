import { Controller, Post } from '@nestjs/common';
import { VentaMedicosService } from '../services/venta.medicos.service';

@Controller('venta')
export class VentaMedicosController {
   constructor(
    private readonly ventaKpiMedicos: VentaMedicosService
   ){

   }
   
   @Post('medidas/oftalmologos')
   kpiOftalmologos(){
    return this.ventaKpiMedicos.kpiOtalmologos()
 
   }
   @Post('medidas/optometras')
   kpiOptometras(){
        return this.ventaKpiMedicos.kpiOptometras()
   }
}
