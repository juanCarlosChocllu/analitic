import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { log } from 'node:console';

import { firstValueFrom } from 'rxjs';
import { abonoI } from 'src/abono/interfaces/abono.interface';

@Injectable()
export class HttpAxiosAbonoService {
  constructor(private readonly httpService: HttpService) {}

  public async reporteAbono(
    mes: string,
    dia: string,
    anio: number,
    retries = 3,
  ) {
    const url = 'http://localhost/opticentro/web/cibelesAbono20240919.csv';

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(url, { timeout: 30000 }),
        );
        const venta = this.extracionDeInformacionValida(response.data);
        venta.shift();
        return venta;
      } catch (error) {
        const mensage = error.message.split(' ');
        if (mensage[5] == 404) {
          throw new NotFoundException('Error no se encontro ningun archivo');
        } else if (error.code === 'ECONNABORTED') {
          console.log(
            `Intento ${attempt} fallido: la solicitud tomó demasiado tiempo.`,
          );
        } else if (error.message.includes('socket hang up')) {
          console.log(
            `Intento ${attempt} fallido: se perdió la conexión con el servidor.`,
          );
        } else {
          throw new InternalServerErrorException(
            'Error: ocurrió un problema al procesar la solicitud.',
          );
        }
        if (attempt === retries) {
          throw new InternalServerErrorException(
            'Error: se agotaron los reintentos para la solicitud.',
          );
        }
        await this.delay(1000);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extracionDeInformacionValida(data: any) {    
    const lineas: any[] = data.trim().split('\n');    
    const abono = lineas.map((linea) => {
      const columnas = linea.split(';');
      const fechaCSV = columnas[0].split(' ');
      const resultado: abonoI = {
        fecha: fechaCSV[0],
        numeroTicket: columnas[1],
        monto: Number(columnas[2]),
        flag: columnas[3],
      };
      return resultado;
    });
       return abono;
  }
}
