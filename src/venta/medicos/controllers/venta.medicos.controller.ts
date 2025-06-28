import { Body, Controller, Post } from '@nestjs/common';
import { VentaMedicosService } from '../services/venta.medicos.service';
import { VentaMedicosDto } from '../dto/venta.medicos.dto';
import { EstadoVentaE } from 'src/venta/core/enums/estado.enum';
import { Public } from 'src/autenticacion/decorators/public.decorator';
import { BuscadorRecetaDto } from '../dto/BuscadorReceta.dto';

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
   
   @Post('recetas/medicos')
   listarRecetasMedico(){
     return this.ventaKpiMedicos.listarRecetasMedico()
   }

}
