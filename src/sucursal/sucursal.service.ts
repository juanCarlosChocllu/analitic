import { Injectable, Type } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { SuscursalExcel } from './schema/sucursal.schema';
import { Model, Types } from 'mongoose';
import { Flag } from './enums/flag.enum';
import { SucursalVentasI } from './interfaces/venta.interface';
import { VentaDto } from 'src/venta/dto/venta.dto';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class SucursalService {
  constructor(
    @InjectModel(SuscursalExcel.name, NombreBdConexion.oc)
    private readonly SucursalSchema: Model<SuscursalExcel>,
  ) {}



   public async  listarSucursalId(id:Types.ObjectId){
    const sucursal = await this.SucursalSchema.findById(id)
    return sucursal

   }

   async sucursalExcel(id: string) {
    const suscursales = await this.SucursalSchema.find({
      empresa: new Types.ObjectId(id),
    });
    return suscursales;
  }


 
}
