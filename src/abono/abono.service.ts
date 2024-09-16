import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpAxiosAbonoService } from 'src/providers/http.Abono.service';
import { diasDelAnio } from 'src/providers/util/dias.anio';
import { Abono } from './schema/abono.abono';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { abonoI } from './interfaces/abono.interface';
import { VentaService } from 'src/venta/venta.service';
import { log } from 'node:console';

@Injectable()
export class AbonoService {
  constructor(
    @InjectModel(Abono.name, NombreBdConexion.oc)
    private readonly SchemaAbono: Model<Abono>,
    private readonly httpAxiosAbonoService: HttpAxiosAbonoService,
    private readonly ventaService: VentaService,
  ) {}

  async extraerAbono() {
    const dataAnio = diasDelAnio(2023);

    // for (let data of dataAnio) {
    // const [mes, dia] = data.split('-');
    // console.log(mes , dia, 2023);
    const mes: string = '08';
    const dia: string = '27';
    const aqo: number = 2024;
    try {
      const dataAbono: abonoI[] = await this.httpAxiosAbonoService.reporteAbono(
        mes,
        dia,
        aqo,
      );

      this.ventaService.vericarVentaParaCadaAbono(dataAbono);
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log(
          `Archivo no encontrado para la fecha ${dia}/${mes}/${aqo}. Continuando con el siguiente día.`,
        );
        //  continue;
      } else {
        throw error;
      }
    }
    //  }

    return { status: HttpStatus.OK };
  }
}
