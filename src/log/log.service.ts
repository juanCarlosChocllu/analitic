import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Log } from './schemas/log.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name, NombreBdConexion.oc) private readonly logSchema:Model<Log> ){}
  create(createLogDto: CreateLogDto) {
    return 'This action adds a new log';
  }

  logFindVenta() {
    return this.logSchema.find({schema:'Venta'});
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }

   public async  registroLogDescarga(descripcion:string, schema:string){
    await this.logSchema.create({ descripcion, schema})
    return

  }
}
