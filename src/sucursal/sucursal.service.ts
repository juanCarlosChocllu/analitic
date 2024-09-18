import { HttpStatus, Injectable, Type } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { SuscursalExcel } from './schema/sucursal.schema';
import { Model, Types } from 'mongoose';

import { NombreBdConexion } from 'src/enums/nombre.db.enum';

import {dataEmpresa} from './data.empresas'

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

  public async guardarEmpresaYsusSucursales() {
    const data = dataEmpresa();

    for (let [empresa, sucursales] of Object.entries(data.empresa)) {
      const empresaData = {
        nombre: empresa,
      };

      try {
        const empresas = await this.SucursalSchema.findOne({
          nombre: empresa,
        });
        if (!empresas) {
          await this.SucursalSchema.create(empresaData);
        }
        for (let sucursal of sucursales) {
          const sucursalExiste = await this.SucursalSchema.findOne({
            nombre: sucursal,
          });
          if (!sucursalExiste) {
            const empresas = await this.SucursalSchema.findOne({
              nombre: empresa,
            });
            const sucursalData = {
              empresa: empresas._id,
              nombre: sucursal,
            };
            await this.SucursalSchema.create(sucursalData);
          }
        }
        return {status:HttpStatus.CREATED}
      } catch (error) {
        console.error(
          `Error al crear empresa o sucursal para ${empresa}: `,
          error,
        );
      }
    }
  }

 
}
