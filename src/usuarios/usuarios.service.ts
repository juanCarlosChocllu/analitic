import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './schema/usuario.schema';
import { Model, Types } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import * as argon2 from "argon2";
import { Flag } from 'src/common/enums/flag';
import { log } from 'node:console';
import { flag } from 'src/venta/enums/flag.enum';
import { ResetearContrasena } from './dto/resetar-contrasena.dto';
import { PassThrough } from 'node:stream';



@Injectable()
export class UsuariosService {

  private readonly opcionesArgon2:argon2.Options={
    type: argon2.argon2id,
    timeCost: 6,
    memoryCost: 2 ** 16,
    parallelism: 1,
    hashLength: 50,
  }
  constructor ( @InjectModel(Usuario.name, NombreBdConexion.oc) private readonly usuarioSchema:Model<Usuario> ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    
    const username = await this.usuarioSchema.findOne({username:createUsuarioDto.username, flag:Flag.nuevo})
    if(username){
      throw new ConflictException('El usuario ya existe ')
    }
    createUsuarioDto.password = await argon2.hash(createUsuarioDto.password, this.opcionesArgon2)
    await this.usuarioSchema.create(createUsuarioDto)
    return {status:HttpStatus.CREATED};
  }

  
  async buscarUsuaurio(username:string){
    const usuario = await this.usuarioSchema.findOne({username:username, flag:Flag.nuevo}).select('+password')  
    return usuario
  }

  async findAll() {
    const usuario= await this.usuarioSchema.find({flag:Flag.nuevo});
    return usuario
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  async softDelete(id: string) {
    const usuario = await this.usuarioSchema.findById(id)
    if(!usuario){
      throw new NotFoundException()
    }
    await this.usuarioSchema.findOneAndUpdate(new Types.ObjectId(id), {flag:Flag.eliminado})
    return {status:HttpStatus.OK};
  }

  async perfil(idUsuario:Types.ObjectId){
    const usuario = await this.usuarioSchema.findById(idUsuario)    
    return usuario
  }

  async buscarUsuarioPorId(id:Types.ObjectId){
    const usuario = await this.usuarioSchema.findOne({_id:new Types.ObjectId(id),flag:Flag.nuevo})
    return usuario
  }

  async resetarContrasenaUsuario(resetearContrasena: ResetearContrasena, id:Types.ObjectId){
    const usuario = await this.usuarioSchema.findById(id)
    if(!usuario){
      throw new NotFoundException()
    }
    resetearContrasena.password = await argon2.hash(resetearContrasena.password, this.opcionesArgon2)
     await this.usuarioSchema.findByIdAndUpdate(id,{$set:{password:resetearContrasena.password}})
     return {status:HttpStatus.OK,   message: 'La contraseña se ha cambiado con éxito.' }

  }
}
