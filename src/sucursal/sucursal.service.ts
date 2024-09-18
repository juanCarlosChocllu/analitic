import { HttpStatus, Injectable, Type } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { SuscursalExcel } from './schema/sucursal.schema';
import { Model, Types } from 'mongoose';

import { NombreBdConexion } from 'src/enums/nombre.db.enum';

import {dataEmpresa} from './data.empresas'
import { EmpresaExcel } from 'src/empresa/schemas/empresa.schema';
import { log } from 'node:console';

@Injectable()
export class SucursalService {
  constructor(
    @InjectModel(SuscursalExcel.name, NombreBdConexion.oc)
    private readonly SucursalSchema: Model<SuscursalExcel>,
    @InjectModel(EmpresaExcel.name, NombreBdConexion.oc)
    private readonly EmpresaSchema: Model<EmpresaExcel>,
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
    console.log(data.empresa);
  
    for (let [empresa, sucursales] of Object.entries(data.empresa)) {
      const empresaData = {
        nombre: empresa,
      };
  
      try {

        const empresaEncontrada = await this.EmpresaSchema.findOne({
          nombre: empresa,
        });
  

        if (!empresaEncontrada) {
          await this.EmpresaSchema.create(empresaData);
        }
  

        const empresaCreada = await this.EmpresaSchema.findOne({
          nombre: empresa,
        });
  
        for (let sucursal of sucursales) {

          const sucursalExiste = await this.SucursalSchema.findOne({
            nombre: sucursal,
          });
  
 
          if (!sucursalExiste) {
            const sucursalData = {
              empresa: empresaCreada._id, 
              nombre: sucursal,
            };
            await this.SucursalSchema.create(sucursalData);
          }
        }
        
      } catch (error) {
        console.error(
          `Error al crear empresa o sucursal para ${empresa}: `,
          error,
        );
      }
    }
  
    return { status: HttpStatus.CREATED };
  }
  

 
}
