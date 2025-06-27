import { HttpService } from '@nestjs/axios';
import {
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { LogService } from 'src/log/log.service';

import { DescargarDto } from 'src/reporte/dto/Descargar.dto';
import { descargarData } from './interface/descargarData';
import { apiMia, tokenDescargas } from 'src/core/config/variables.entorno.config';
import { VentaI } from './interface/Venta';

@Injectable()
export class HttpServiceAxios {
  constructor(
    private readonly httpService: HttpService,
    private readonly logService:LogService
  ) {}
  public async reporte(
    descargarDto:DescargarDto,
  ): Promise<VentaI[]> {
    
      try {
        const body :descargarData ={
          fechaFin:descargarDto.fechaFin,
          fechaInicio:descargarDto.fechaInicio,
          token:tokenDescargas
        }
        const response = await firstValueFrom(
          this.httpService.post(apiMia, body),
        );
        console.log(response.data);
        
        return response.data
      } catch (error) {  
                  const descripcion:string = `Error de descarga fecha: ${descargarDto.fechaInicio} a ${descargarDto.fechaFin}  `
              await this.logService.registroLogDescargaError(descripcion, 'Venta' , HttpStatus.BAD_REQUEST , 'BAD_REQUEST' )
                      
        throw error
     
  }
  }

 
}
