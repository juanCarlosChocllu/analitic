import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AutenticacionDto } from './dto/autenticacion.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AutenticacionService {
  constructor (
     private readonly usuarioService:UsuariosService,
     private readonly jwtService:JwtService

  ){}
  async autenticacion(autenticacionDto: AutenticacionDto) {
    const usuario = await  this.usuarioService.buscarUsuaurio(autenticacionDto.username)
    if(usuario){
      const match = await  argon2.verify(usuario.password, autenticacionDto.password)
      if(match){
       const token = await this.jwtService.signAsync({
        sub: usuario.id, username: usuario.username
       })
       return {
        status:HttpStatus.OK,
        token,
        rol:usuario.rol,
       }
      }
      throw new UnauthorizedException('Credenciales invalidas')
    }
    throw new UnauthorizedException('Credenciales invalidas')
  }

 
}
