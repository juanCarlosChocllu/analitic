import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpAxiosAbonoService } from 'src/providers/http.Abono.service';
import { diasDelAnio } from 'src/providers/util/dias.anio';

@Injectable()
export class HttpAbonoService {
  constructor(private readonly httAxiosAbonoService:HttpAxiosAbonoService){}
    
  async extraerAbono() {
    const dataAnio = diasDelAnio(2023);
  
    // for (let data of dataAnio) {
      // const [mes, dia] = data.split('-');
      // console.log(mes , dia, 2023);
       const mes:string='08'
       const dia:string='27'
       const aqo:number=2024
       try {
    
       const dataAbono= await    this.httAxiosAbonoService.reporteAbono(mes, dia, aqo)
       console.log(dataAbono);
       
       } catch (error) {
         if (error instanceof NotFoundException) {
           console.log(`Archivo no encontrado para la fecha ${dia}/${mes}/2023. Continuando con el siguiente día.`);
         //  continue;
         } else {
           throw error;
         }
       }
   //  }

    return 'This action adds a new abono';
  }


}
