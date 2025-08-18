import { HttpStatus, Injectable, Type } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Sucursal } from './schema/sucursal.schema';
import { Model, Types } from 'mongoose';


import {dataEmpresa} from './data.empresas'
import { Empresa } from 'src/empresa/schemas/empresa.schema';

import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';

@Injectable()
export class SucursalService {
  constructor(
    @InjectModel(Sucursal.name, NombreBdConexion.oc)
    private readonly SucursalSchema: Model<Sucursal>,
    @InjectModel(Empresa.name, NombreBdConexion.oc)
    private readonly EmpresaSchema: Model<Empresa>,
  ) {}

   public async buscarSucursal(sucursal:string){
     const sucur =await this.SucursalSchema.findOne({nombre:sucursal})
     return sucur

   }

   public async listarTodasLasSucursales (){
    const sucursales = await this.SucursalSchema.find()
    return sucursales
   }
   public async  listarSucursalId(id:Types.ObjectId):Promise<SucursalI>{
    const sucursal:SucursalI = await this.SucursalSchema.findById(id)
    return sucursal

   }
   
   async sucursalListaEmpresas(id: Types.ObjectId):Promise<SucursalI[]>{
    const suscursales:SucursalI[] = await this.SucursalSchema.find({
      empresa: new Types.ObjectId(id),
    });
    return suscursales;
  }

  async sucursalListaEmpresaOne(id: Types.ObjectId):Promise<SucursalI[]>{
    const suscursales:SucursalI[] = await this.SucursalSchema.findOne({
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
  public async guardarSucursal(empresa:string,sucursal:string){
    const empresaEncontrada = await this.EmpresaSchema.findOne({
      nombre: empresa,
    });
    if(!empresaEncontrada){
      return { status: HttpStatus.BAD_REQUEST ,message:'Empresa no encontrada'};
    }
    const sucursalExiste = await this.SucursalSchema.findOne({
      nombre: sucursal,
    });
    if(sucursalExiste){
      return { status: HttpStatus.BAD_REQUEST ,message:'Sucursal ya existe'};
    }
    const sucursalData = {
      nombre: sucursal,
      empresa:empresaEncontrada._id
    };
    await this.SucursalSchema.create(sucursalData);
    return { status: HttpStatus.CREATED };
  }
  
 
  async listarSucursalesArray(id:Types.ObjectId[]){
    const sucursales = await this.SucursalSchema.find({_id:{$in: id.map((i)=> new Types.ObjectId(i))}})
    return sucursales
  }
}
