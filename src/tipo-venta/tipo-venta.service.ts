import { Injectable } from '@nestjs/common';
import { TipoVenta } from './schemas/tipo-venta.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class TipoVentaService {
  constructor(@InjectModel(TipoVenta.name,NombreBdConexion.oc) private  readonly  TipoVentaSchema:Model<TipoVenta>){}

  findAll() {
    return this.TipoVentaSchema.find({},'nombre').exec();
  }


  public async guardarTipoVenta(nombre:string){
    const data:TipoVenta={
      nombre:nombre

    }  
    await this.TipoVentaSchema.create(data)
  }
  
  public async verificarTipoVenta(nombre:string){
    const tipoVenta =  await this.TipoVentaSchema.findOne({nombre:nombre}).select('nombre')
    return tipoVenta

  }

}
