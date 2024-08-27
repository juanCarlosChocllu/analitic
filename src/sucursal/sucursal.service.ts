import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Sucursal } from './schema/sucursal.schema';
import { Model, Types } from 'mongoose';
import { Flag } from './enums/flag.enum';
import { SucursalVentasI } from './interfaces/venta.interface';
import { VentaDto } from 'src/venta/dto/venta.dto';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class SucursalService {
  constructor(@InjectModel(Sucursal.name,NombreBdConexion.mia) private  readonly SucursalSchema : Model<Sucursal> ){}

  findAll(id:string){
    const sucursal = this.SucursalSchema.find({empresa:new Types.ObjectId(id) ,flag:Flag.nuevo}, 'nombre ciudad, flag').exec();
    return sucursal
  }

   async buscarSucursalVentas(ventaDto:VentaDto) {
    let ventas:SucursalVentasI[]=[]
     for(let sucursal of ventaDto.sucursal){
     const sucursalVentas:SucursalVentasI[]= await this.SucursalSchema.aggregate([
        {
          $match:{_id:new Types.ObjectId(sucursal)}
        },
       {
        $lookup:{
          from: 'Venta',
          localField: "_id",
          foreignField:"sucursal",
          as:"ventas"
          
        }
      },
      {
        $unwind:'$ventas'
      },
      {
        $match:{
          'ventas.tipoVenta': {$in:ventaDto.tipoVenta.map(tipoVenta=> new Types.ObjectId(tipoVenta)) },
          'ventas.fecha':{$gte: new Date(ventaDto.fechaInicio),  $lte: new Date(ventaDto.FechaFin)},
          'ventas.flag':ventaDto.flag
         }
  
      },
      {
        $group: {
            _id: "$_id",
            NombreSucursal: { $first: "$nombre" },
            totalVenta: { $sum: "$ventas.precioTotal" }, 
            cantidadVentas: { $sum: 1 } 
        }
    }
      ])       
    ventas.push(...sucursalVentas)
     }  
   
     return ventas

   }
  
    async buscarScursal(id:Types.ObjectId ){
      const sucursal= await this.SucursalSchema.findOne({ _id: id }, 'nombre').lean().exec();

      return sucursal.nombre

   }


  
}
