import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMetasSucursalDto } from '../dto/create-metas-sucursal.dto';
import { UpdateMetasSucursalDto } from '../dto/update-metas-sucursal.dto';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flag } from 'src/core/enums/flag';
import { flagVenta } from 'src/venta/core/enums/flgaVenta.enum';
import { BuscadorMetasDto } from '../dto/BuscadorMetasDto';
import { CoreService } from 'src/core/services/core.service';
import { eachDayOfInterval } from 'date-fns';
import { MetasSucursal } from '../schema/metas-sucursal.schema';
import { DiasMetaService } from './diaMeta.service';


@Injectable()
export class MetasSucursalService {
  constructor(
    @InjectModel(MetasSucursal.name, NombreBdConexion.oc)
    private readonly metasSucursal: Model<MetasSucursal>,

    private readonly diaMetaService: DiasMetaService,
    private readonly coreService: CoreService,
  ) {}

  async create(createMetasSucursalDto: CreateMetasSucursalDto) {
   // const dias = this.coreService.arrayDias(createMetasSucursalDto.fechaInicio, createMetasSucursalDto.fechaFin)
    for (const sucursal of createMetasSucursalDto.sucursal) {  
      const meta=  await this.metasSucursal.create({
        ticket: createMetasSucursalDto.ticket,
        fechaFin: createMetasSucursalDto.fechaFin,
        fechaInicio: createMetasSucursalDto.fechaInicio,
        monto: createMetasSucursalDto.monto,
        sucursal: new Types.ObjectId(sucursal),
      })

      /*for (const dia of dias) {
        await  this.diaMetaService.create(dia, meta._id)
        
      }*/
    }


    return { status: HttpStatus.CREATED };
  }
  
 
  
    async findAll(buscadorMetasDto: BuscadorMetasDto) {
    const [fechaInicio, fechaFin] = this.coreService.formateoFechasUTC(
      buscadorMetasDto.fechaInicio,
      buscadorMetasDto.fechaFin,
    );

    const [fechaMetaInicio, fechaMetaFin] = this.coreService.formateoFechasUTC(
      buscadorMetasDto.fechaMetaInicio,
      buscadorMetasDto.fechaMetaFin,
    );


    
    const countDocuments = await this.metasSucursal.countDocuments({
      flag: Flag.nuevo,
      ...(buscadorMetasDto.sucursal
        ? { sucursal: new Types.ObjectId(buscadorMetasDto.sucursal) }
        : {}),
      ...(buscadorMetasDto.fechaInicio && buscadorMetasDto.fechaFin
        ? {
            fecha: {
              $gte: fechaInicio,
              $lte: fechaFin,
            },
          }
        : {}),

      ...(buscadorMetasDto.fechaMetaInicio && buscadorMetasDto.fechaMetaFin
        ? { fechaInicio: fechaMetaInicio, fechaFin: fechaMetaFin }
        : {}),
    });
    const paginas = Math.ceil(countDocuments / Number(buscadorMetasDto.limite));

    const metas = await this.metasSucursal
      .aggregate([
        {
          $match: {
            flag: Flag.nuevo,
            ...(buscadorMetasDto.sucursal
              ? { sucursal: new Types.ObjectId(buscadorMetasDto.sucursal) }
              : {}),
            ...(buscadorMetasDto.fechaInicio && buscadorMetasDto.fechaFin
              ? {
                  fecha: {
                    $gte: fechaInicio,
                    $lte: fechaFin,
                  },
                }
              : {}),
            ...(buscadorMetasDto.fechaMetaInicio &&
            buscadorMetasDto.fechaMetaFin
              ? { fechaInicio:  {$gte:fechaMetaInicio}, fechaFin:{$lte: fechaMetaFin }}
              : {}),
          },
        },
        {
          $lookup: {
            from: 'Sucursal',
            foreignField: '_id',
            localField: 'sucursal',
            as: 'sucursal',
          },
        },
        {
          $unwind: { path: '$sucursal', preserveNullAndEmptyArrays: false },
        },
        {
          $project: {
            _id: 1,
            monto: 1,
            ticket: 1,
            sucursal: '$sucursal.nombre',
            fechaInicio: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$fechaInicio',
              },
            },
            fechaFin: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$fechaFin',
              },
            },
            fecha: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$fecha',
              },
            },
          },
        },
      ])
      .skip(
        (Number(buscadorMetasDto.pagina) - 1) * Number(buscadorMetasDto.limite),
      )
      .limit(Number(buscadorMetasDto.limite))
      .sort({ fecha: -1 });


    return { paginas: paginas == 0 ? 1 : paginas, data: metas };
  }

  findOne(id: number) {
    return `This action returns a #${id} metasSucursal`;
  }

  update(id: number, updateMetasSucursalDto: UpdateMetasSucursalDto) {
    return `This action updates a #${id} metasSucursal`;
  }

  async softDelete(id: Types.ObjectId) {
    const meta = await this.metasSucursal.findOne({
      _id: new Types.ObjectId(id),
      flag: Flag.nuevo,
    });
    if (!meta) {
      throw new NotFoundException();
    }
    await this.metasSucursal.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { flag: flagVenta.eliminado },
    );

    return { status: HttpStatus.OK };
  }

  async listarMetasSucursal(
    sucursal: Types.ObjectId,
    fechaInicio: string,
    fechaFin: string,
  ): Promise<MetasSucursal> {
    const [f1,f2] =this.coreService.formateoFechasUTC(fechaInicio, fechaFin)    
    const meta = await this.metasSucursal.findOne({
      sucursal: new Types.ObjectId(sucursal),
      flag: Flag.nuevo,
      fechaInicio:f1
    });

    return meta;
   /* if(meta){
      const dias = await this.diaMetaService.metasDias(f1, f2, meta._id)
      if(dias.length > 0) {
        return meta;
      } 
    }*/
  
  }
}
