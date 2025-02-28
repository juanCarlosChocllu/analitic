import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { VentaExcelI } from 'src/venta/core/interfaces/ventaExcel.interface';
import { flag } from 'src/venta/core/enums/flag.enum';
import { LogService } from 'src/log/log.service';
import { AxiosError } from 'axios';
import { DescargarDto } from 'src/reporte/dto/Descargar.dto';
import { descargarData } from './interface/descargarData';
import { tokenDescargas } from 'src/core/config/variables.entorno.config';
import { VentaI } from './interface/Venta';
import { BuscadorMedicoDto } from 'src/medico/dto/BuscadorMedico.dto';

@Injectable()
export class HttpAxiosVentaService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logService:LogService
  ) {}
  public async reporte(
    descargarDto:DescargarDto,
  ): Promise<VentaI[]> {
   const url = `http://localhost/opticentro/web/api/ventas`;  
      try {
        const body :descargarData ={
          fechaFin:descargarDto.fechaFin,
          fechaInicio:descargarDto.fechaInicio,
          token:tokenDescargas
        }
        const response = await firstValueFrom(
          this.httpService.post(url, body),
        );
        console.log(response.data);
        
        return response.data
      } catch (error) {  
                  const descripcion:string = `Error de fecha: ${descargarDto.fechaInicio} a ${descargarDto.fechaFin}  `
              await this.logService.registroLogDescargaError(descripcion, 'Venta' , HttpStatus.BAD_REQUEST , 'BAD_REQUEST' )
                      
        throw error
     
  }
  }

 
}
