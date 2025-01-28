import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpAxiosAbonoService } from 'src/providers/http.Abono.service';
import { diasDelAnio } from 'src/providers/util/dias.anio';
import { Abono } from './schema/abono.abono';
import { Model, Types } from 'mongoose';

import { abonoI } from './interfaces/abono.interface';
import { VentaService } from 'src/venta/services/venta.service';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class AbonoService {
  constructor(
    @InjectModel(Abono.name, NombreBdConexion.oc)
    private readonly AbonoSchema: Model<Abono>,
    private readonly httpAxiosAbonoService: HttpAxiosAbonoService,

    @Inject(forwardRef(() =>VentaService)) private readonly ventaService: VentaService,
  ) {}


  public async buscarAbonoPorNumeroTicket(numeroTicket:string){
    const abono = await this.AbonoSchema.find({
      numeroTicket:numeroTicket,
    });

    return abono
  }

  public async vericarVentaParaCadaAbono(abono: abonoI[]) {        
    for (let data of abono) {         
      const venta = await this.ventaService.verificarVentaExistente(data.numeroTicket)  
      if (venta) {
        const abonoExiste = await this.AbonoSchema.find({
          numeroTicket: venta.numeroTicket,
        }).exec();
    
        if (abonoExiste.length > 0) {
          const total = abonoExiste.reduce((total, a) => total + a.monto, 0);
          if ( total < venta.montoTotal) {
            const dataAbono: abonoI = {
              numeroTicket: data.numeroTicket,
              monto: data.monto,
              fecha: data.fecha,
              flag: data.flag,
              venta:new Types.ObjectId(venta._id)
            };
              await this.AbonoSchema.create(dataAbono);
          }

         } else{
          const dataAbono: abonoI = {
            numeroTicket: data.numeroTicket,
            monto: data.monto,
            fecha: data.fecha,
            flag: data.flag,
            venta:new Types.ObjectId(venta._id)
          };
           await this.AbonoSchema.create(dataAbono);
        }
      }
    }
  }

  async descargarAbono() {
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

       await this.vericarVentaParaCadaAbono(dataAbono);
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
