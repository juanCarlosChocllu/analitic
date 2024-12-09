import { HttpService } from '@nestjs/axios';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { VentaExcelI } from 'src/venta/interfaces/ventaExcel.interface';
import { flag } from 'src/venta/enums/flag.enum';
import { LogService } from 'src/log/log.service';

@Injectable()
export class HttpAxiosVentaService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logService:LogService
  ) {}
  public async reporte(
    mes: string,
    dia: string,
    anio: number,
    retries = 3,
  ): Promise<any> {
  const url = `https://comercial.opticentro.com.bo/cibeles${anio}${mes}${dia}.csv`;
 //   const url =`http://localhost/opticentro/web/cibeles${anio}${mes}${dia}.csv`
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
          const descripcion:string = `Archivo no encontrado error 404 de la fecha: ${anio}/${mes}/${dia}`
          await this.logService.registroLogDescarga(descripcion,'Venta',HttpStatus.NOT_FOUND,'Not found',`${anio}-${mes}-${dia}`)
          throw new NotFoundException('Error no se encontro ningun archivo');
        } else if (error.code === 'ECONNABORTED') {
          const descripcion = `Intento fallido: la solicitud tomó demasiado tiempo.  fecha: ${anio}/${mes}/${dia}`
          this.logService.registroLogDescarga(descripcion,'Venta', HttpStatus.GATEWAY_TIMEOUT, 'ECONNABORTED',`${anio}-${mes}-${dia}` )
        } else if (error.message.includes('socket hang up')) {
          const descripcion:string = `Intento  fallido: se perdió la conexión con el servidor: socket hang up: fecha: ${anio}/${mes}/${dia}`
           await this.logService.registroLogDescarga(descripcion,'Venta', HttpStatus.REQUEST_TIMEOUT, 'socket hang up',`${anio}-${mes}-${dia}` )
        } else {
          const descripcion:string = `Error: ocurrió un problema al procesar la solicitud de la fecha: ${anio}/${mes}/${dia}`
          await this.logService.registroLogDescarga(descripcion,'Venta',HttpStatus.BAD_REQUEST, 'BAD REQUEST',`${anio}-${mes}-${dia}` )
          throw new InternalServerErrorException(
            'Error: ocurrió un problema al procesar la solicitud.',
          );
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
        asesor: columnas[22],
        montoTotal: Number(columnas[28]),
        tipoVenta: columnas[29] ? columnas[29] : 'CONTADO',
        flagVenta: columnas[30] ? columnas[30] : flag.FINALIZADO,
      };

      return resultado;
    });
    return venta;
  }


  async informacionRestanteVenta(fechaInicio:string, fechaFin:string){
      try {
            const url ='http://localhost/opticentro/web/app_dev.php/listar/venta/api'
            const data={
              fechaInicio,
              fechaFin,
              token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzIyYTEyMTU5ZmZmMzAzYWY3ODkxNjYiLCJ1c2VybmFtZSI6Imthbm5hMiIsImlhdCI6MTczMzE0NTM0NCwiZXhwIjoxNzMzMTYzMzQ0fQ.p1wF-qQ_xLOjQ85vMFfxXCJBYEHgOqCcjmZ3YpU5Y2g'
            }    
            const response = await firstValueFrom(this.httpService.post(url, data))
            return response.data
      } catch (error) {
          throw error
      }

  }
}
