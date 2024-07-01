import { HttpCode, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Venta } from './schemas/venta.schema';
import { Model, Types } from 'mongoose';
import { BusquedaVentaDto } from './dto/busqueda-venta.dto';

@Injectable()
export class VentaService {

  constructor(
    @InjectModel(Venta.name) private  readonly  VentaSchema:Model<Venta>
   
){}

  async findAll(idSucursal:Types.ObjectId, busquedaVentaDto:BusquedaVentaDto) {
      const {tipoVenta, fechaInicio, fechaFin }= busquedaVentaDto
      const busqueda:any ={ sucursal:new Types.ObjectId(idSucursal)}
       if(tipoVenta){
        busqueda.tipoVenta=new Types.ObjectId(tipoVenta)
     }
      if( fechaInicio || fechaFin){
        busqueda.fecha={$gte:new  Date(fechaInicio) , $lte: new Date(fechaFin) }
      }
    
   
      
  
 
      

    const ventas = await this.totalVentasPorSucursalOTipoVenta(busqueda) 
    const resultado={
      HttpStatus:HttpStatus.OK,
      ventas
    }

    return resultado
}



private async totalVentasPorSucursalOTipoVenta( filtrador:any ){
  const ventas= await this.VentaSchema.aggregate([
    {
      $match:filtrador
    },
    {
      $group:{
        _id:null,
        precioTotal:{$sum: '$precioTotal'},
        totalVentas:{$sum:1}
      }
    }
  ])

  return ventas

}


}
