import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { VentaExcelI } from 'src/venta/interfaces/ventaExcel.interface';
import { flag } from 'src/venta/enums/flag.enum';
import { log } from 'node:console';
@Injectable()
export class HttpAxiosVentaService {
  constructor(private readonly httpService: HttpService) {}
  public async reporte(
    mes: string,
    dia: string,
    anio: number,
    retries = 3,
  ): Promise<any> {
   const url = `https://comercial.opticentro.com.bo/cibeles${anio}${mes}${dia}.csv`;
     //const url= 'http://localhost/opticentro/web/cibelesVenta20240919.csv'
  for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(url, { timeout: 30000 }),
        );
        let venta = this.extracionDeInformacionValida(response.data);
       // venta = venta.filter((venta)=> venta.fecha === `${anio}-${mes}-${dia}` )
        venta.shift(); // Elimina el primer elemento del array donde obtiene los nombres de cada celda

        return venta;
      } catch (error) {
        const mensage = error.message.split(' ');
        if (mensage[5] == 404) {
          throw new NotFoundException('Error no se encontro ningun archivo');
        } else if (error.code === 'ECONNABORTED') {
          console.log(
           `Intento fallido: la solicitud tomó demasiado tiempo.`,
          );
        } else if (error.message.includes('socket hang up')) {
          console.log(
            `Intento  fallido: se perdió la conexión con el servidor: socket hang up: fecha:${anio}${mes}${dia}`,
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

  // Método auxiliar para introducir un retraso entre reintentos
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extracionDeInformacionValida(data: any) {
    const lineas: any[] = data.trim().split('\n');
    const venta = lineas.map((linea) => {
      const columnas = linea.split(';');
      const fechaCSV = columnas[0].split(' ');

      const resultado: VentaExcelI = {
        fecha: fechaCSV[0],
        numeroTicket: columnas[1],
        aperturaTicket: columnas[2],
        sucursal: columnas[3],
        atributo1:columnas[5], 
        atributo2: columnas[6],
        atributo3: columnas[7],
        atributo4: columnas[8],
        atributo5:columnas[9],
        atributo6: columnas[10],
        producto: columnas[12],
        cantidad: Number(columnas[19]),
        importe: columnas[20],
        asesor: columnas[21],
        montoTotal: Number(columnas[28]),
        tipoVenta: columnas[29] ? columnas[29] : 'CONTADO',
        flagVenta: columnas[30] ? columnas[30] : flag.FINALIZADO,
      };

      return resultado;
    });
    return venta;
  }
}
