import { HttpStatus, Injectable } from '@nestjs/common';
import { TipoVenta } from './schemas/tipo-venta.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class TipoVentaService {
  constructor(
    @InjectModel(TipoVenta.name, NombreBdConexion.oc)
    private readonly TipoVentaSchema: Model<TipoVenta>,
  ) {}
  listarTipoVenta() {
    return this.TipoVentaSchema.find();
  }

  public async guardarTipoVenta() {
    const tipoVenta=[
    {  nombre: 'CONTADO', abreviatura: 'CON'},
    {  nombre: 'CREDITO', abreviatura: 'CRE'},
    {  nombre: 'VENTAS A FAMILIARES', abreviatura: 'VEF'},
    {  nombre: 'VENTA CAMBIO DE MONTURA', abreviatura: 'CM'},
    {  nombre: 'DESCUENTO AUTORIZADO', abreviatura: 'DA'},
    {  nombre: 'FALLA_DE_FABRICA', abreviatura: 'FF'},
    {  nombre: 'PRODUCTOS Y/O INSUMOS', abreviatura: 'PROD'},
    {  nombre: 'REPROCESO', abreviatura: 'REP'},
    {  nombre: 'VENTA CORRECCIÓN DE OFTALMOLOGO', abreviatura: 'CO'} ]
 
     for(let tipo of tipoVenta){
      const tipoV= await this.TipoVentaSchema.findOne({nombre:tipo.nombre})
        if(!tipoV){
          await this.TipoVentaSchema.create(tipo)
        }

     }
     return {status:HttpStatus.CREATED}
  }

  public async verificarTipoVenta(nombre: string) {
    const tipoVenta = await this.TipoVentaSchema.findOne({
      nombre: nombre,
    }).select('nombre');
    return tipoVenta;
  }


  public async tipoVentaAbreviatura(abreviatura:string){
    const abrev= await this.TipoVentaSchema.findOne({abreviatura:abreviatura})   
     return abrev

  }
}
