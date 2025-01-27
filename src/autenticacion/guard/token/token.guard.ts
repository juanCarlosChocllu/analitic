import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { log } from 'node:console';
import { Observable } from 'rxjs';
import { jwtConstants } from 'src/autenticacion/constants/constants';
import { PUBLIC_KEY } from 'src/autenticacion/constants/decorator.constants';
import { Request } from 'express';
import { UsuariosService } from 'src/usuarios/usuarios.service';
@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly  reflector:Reflector,
    private readonly usuariosService:UsuariosService
  ){}
  async canActivate(
    context: ExecutionContext,
  ) {
    const publico = this.reflector.get(PUBLIC_KEY,context.getHandler())

    
    if(publico){
   
        return true
    }
    const request:Request = context.switchToHttp().getRequest()
    const header:string = request.headers.authorization  

    try {
      const token = header.split(' ')[1];  

      
          
      const tokenVerificada = await this.jwtService.verify(token,{
        secret:jwtConstants.secret
      })     
      console.log(tokenVerificada);
      
      const usuario = await this.usuariosService.buscarUsuarioPorId(tokenVerificada.id)      
      if(!usuario){        
        return false
      }
      console.log(usuario);
      
      request.user= usuario._id
            
      return true
    } catch (error) {          
      console.log(error);
        
       throw new UnauthorizedException()
      
    }

  }
}
