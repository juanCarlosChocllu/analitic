import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { LogService } from 'src/log/log.service';

import { DescargarDto } from 'src/reporte/dto/Descargar.dto';
import { descargarData } from './interface/descargarData';
import {
  apiMia,
  rutaComisiones,
  tokenDescargas,
} from 'src/core/config/variables.entorno.config';
import { VentaI } from './interface/Venta';
import { RecetaResponseI } from 'src/receta/interface/receta';
import { AnularVentaMiaI, FinalizarVentaMia } from './interface/VentasMia';
import { webhookMentasI } from 'src/metas-sucursal/interface/metasInterface';
import { AxiosResponse } from 'axios';
import { productos } from 'src/venta/core/enums/productos.enum';

@Injectable()
export class HttpServiceAxios {
  constructor(
    private readonly httpService: HttpService,
    private readonly logService: LogService,
  ) {}
  public async reporte(descargarDto: DescargarDto): Promise<VentaI[]> {
    try {
      const body: descargarData = {
        fechaFin: descargarDto.fechaFin,
        fechaInicio: descargarDto.fechaInicio,
        token: tokenDescargas,
      };
      const response = await firstValueFrom(
        this.httpService.post(`${apiMia}/api/ventas`, body),
      );

      return response.data;
    } catch (error) {
      const descripcion: string = `Error de descarga fecha: ${descargarDto.fechaInicio} a ${descargarDto.fechaFin}  `;
      await this.logService.registroLogDescargaError(
        descripcion,
        'Venta',
        HttpStatus.BAD_REQUEST,
        'BAD_REQUEST',
      );

      throw error;
    }
  }

  public async descargarReceta(
    descargarDto: DescargarDto,
  ): Promise<RecetaResponseI[]> {
    const body: descargarData = {
      fechaFin: descargarDto.fechaFin,
      fechaInicio: descargarDto.fechaInicio,
      token: tokenDescargas,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${apiMia}/api/recetas/medico`, body),
      );

      return response.data;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  public async anularVentas(
    descargarDto: DescargarDto,
  ): Promise<AnularVentaMiaI[]> {
    try {
      const body: descargarData = {
        fechaFin: descargarDto.fechaFin,
        fechaInicio: descargarDto.fechaInicio,
        token: tokenDescargas,
      };
      const response = await firstValueFrom(
        this.httpService.post(`${apiMia}/api/ventas/anuladas`, body),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async finalizarVentasMia(
    descargarDto: DescargarDto,
  ): Promise<FinalizarVentaMia[]> {
    try {
      const body: descargarData = {
        fechaFin: descargarDto.fechaFin,
        fechaInicio: descargarDto.fechaInicio,
        token: tokenDescargas,
      };
      const response = await firstValueFrom(
        this.httpService.post(`${apiMia}/api/ventas/finalizadas2`, body),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async webhookMetasSucursal(
    data: webhookMentasI,
  ): Promise<AxiosResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${rutaComisiones}/api/metas/sucursal/webhook`, data),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
