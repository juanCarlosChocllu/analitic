import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMetasSucursalDto } from './dto/create-metas-sucursal.dto';
import { UpdateMetasSucursalDto } from './dto/update-metas-sucursal.dto';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { MetasSucursal } from './schema/metas-sucursal.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flag } from 'src/core/enums/flag';
import { flagVenta } from 'src/venta/core/enums/flgaVenta.enum';
import { BuscadorMetasDto } from './dto/BuscadorMetasDto';

@Injectable()
export class MetasSucursalService {
    constructor(@InjectModel(MetasSucursal.name, NombreBdConexion.oc) private readonly metasSucursal:Model<MetasSucursal>){}
  
  async create(createMetasSucursalDto: CreateMetasSucursalDto) {
    createMetasSucursalDto.sucursal = new Types.ObjectId(createMetasSucursalDto.sucursal)
    await this.metasSucursal.create(createMetasSucursalDto)
    return {status:HttpStatus.CREATED}
  }

  async findAll(buscadorMetasDto:BuscadorMetasDto) {
 
    
    const countDocuments =await this.metasSucursal.countDocuments({
      flag:Flag.nuevo ,
      ...(buscadorMetasDto.sucursal)?{sucursal:new Types.ObjectId(buscadorMetasDto.sucursal)}:{},
      ...(buscadorMetasDto.fechaInicio && buscadorMetasDto.fechaFin) ?
            {   fecha: {
              $gte: new Date(buscadorMetasDto.fechaInicio),
              $lte: new Date(buscadorMetasDto.fechaFin),
              }
          }
          
          :{} 
    })
   const paginas =  Math.ceil(( countDocuments /Number(buscadorMetasDto.limite) ))

   
    const metas = await this.metasSucursal.aggregate([
      {
        $match:{
          flag:Flag.nuevo,
          ...(buscadorMetasDto.sucursal)?{sucursal:new Types.ObjectId(buscadorMetasDto.sucursal)}:{},
          ...(buscadorMetasDto.fechaInicio && buscadorMetasDto.fechaFin) ?
            {   fecha: {
              $gte: new Date(buscadorMetasDto.fechaInicio),
              $lte: new Date(buscadorMetasDto.fechaFin),
              }
          }
          
          :{} 
        }
      },
      {
        $lookup:{
          from :'Sucursal',
          foreignField:'_id',
          localField:'sucursal',
          as:'sucursal'
        }
      },
      {
        $unwind:{path:'$sucursal', preserveNullAndEmptyArrays:false}
      },
      {
        $project:{
          _id:1,
          monto:1,
          ticket:1,
          sucursal:'$sucursal.nombre',
          fechaInicio: {
            $dateToString: {
              format: '%Y-%m-%d', 
              date: '$fechaInicio'
            }
          },
          fechaFin: {
            $dateToString: {
              format: '%Y-%m-%d', 
              date: '$fechaFin'
            }
          }
        }

      }
    ]).skip( (Number(buscadorMetasDto.pagina)- 1) *Number( buscadorMetasDto.limite)).limit(Number(buscadorMetasDto.limite))
    .sort({fecha:-1})
    
    return {paginas:paginas == 0 ? 1 : paginas , data:metas} ;
  }

  findOne(id: number) {
    return `This action returns a #${id} metasSucursal`;
  }

  update(id: number, updateMetasSucursalDto: UpdateMetasSucursalDto) {
    return `This action updates a #${id} metasSucursal`;
  }

  async softDelete(id: Types.ObjectId) {
    const meta = await this.metasSucursal.findOne({_id:new Types.ObjectId(id), flag:Flag.nuevo} )
    if(!meta){
      throw new NotFoundException()
    }
    await this.metasSucursal.findOneAndUpdate({_id:new Types.ObjectId(id)}, {flag:flagVenta.eliminado})
    
    
    return {status:HttpStatus.OK};
  }

  async listarMestasSucursal(sucursal:Types.ObjectId, fechaInicio:string, fechaFin:string):Promise<MetasSucursal> {
    const metas = await this.metasSucursal.findOne({ sucursal:new Types.ObjectId(sucursal), 
      flag:Flag.nuevo ,
      fechaInicio:new Date(fechaInicio),
      fechaFin:new Date(fechaFin)
    })
  

    return metas
   }

}
