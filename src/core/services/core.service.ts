import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreService {
    
    formateoFechasUTC(fechaInicio:string, fechaFin:string ){
        const  fechaI=new Date(fechaInicio)
        const  fechaF=new Date(fechaFin)
          fechaI.setUTCHours(0, 0, 0, 0)
          fechaF.setUTCHours(23, 59, 59, 999)
          return [fechaI, fechaF ]
      }
}
