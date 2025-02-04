import { Injectable } from '@nestjs/common';
import { eachDayOfInterval } from 'date-fns';

@Injectable()
export class CoreService {
    
    formateoFechasUTC(fechaInicio:string, fechaFin:string ):Date[]{
        const  fechaI=new Date(fechaInicio)
        const  fechaF=new Date(fechaFin)
          fechaI.setUTCHours(0, 0, 0, 0)
          fechaF.setUTCHours(23, 59, 59, 999)
          return [fechaI, fechaF ]
      }



         arrayDias (fechaInicio: string, fechaFin: string):Date[]{
              const fecha1 = new Date(fechaInicio); 
              const fecha2 = new     Date(fechaFin); 
              fecha1.setUTCHours(0, 0, 0, 0)
              fecha2.setUTCHours(23, 59, 59, 999) 
              const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });
              return dias;
          }
        
}
