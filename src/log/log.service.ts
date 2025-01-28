import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Log, LogDescarga } from './schemas/log.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name, NombreBdConexion.oc) private readonly logSchema:Model<Log> ,
    @InjectModel(LogDescarga.name, NombreBdConexion.oc) private readonly logDescarga:Model<LogDescarga> 
  ){}
  create(createLogDto: CreateLogDto) {
    return 'This action adds a new log';
  }

  logFindVenta() {
    return this.logSchema.find({schema:'Venta'}).sort({fecha:-1}) ;
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

   public async  registroLogDescargaError(descripcion:string, schema:string,codigoError:HttpStatus, tipoError:string, fechaFallida:string){
     return this.logSchema.create({ descripcion, schema,codigoError , tipoError , fechaFallida})
  }


  public async  registroLogDescarga(schema:string,fechaDescarga:string){
    return this.logDescarga.create({ schema:schema, fechaDescarga:fechaDescarga})
 }
 
 public async listarLogdescarga(){
  return this.logDescarga.find().limit(1).sort({fechaDescarga:-1})
 }

}
