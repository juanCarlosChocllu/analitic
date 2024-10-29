import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { log } from 'node:console';
import { Observable } from 'rxjs';
import { jwtConstants } from 'src/autenticacion/constants/constants';
import { PUBLIC_KEY } from 'src/autenticacion/constants/decorator.constants';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly  reflector:Reflector
  ){}
  async canActivate(
    context: ExecutionContext,
  ) {
    const publico = this.reflector.get(PUBLIC_KEY,context.getHandler())

    
    if(publico){
   
        return true
    }

    
    const request = context.switchToHttp().getRequest()
    const header:string = request.headers.authorization  

    try {
      const token = header.split(' ')[1];      
      const tokenVerificada = await this.jwtService.verify(token,{
        secret:jwtConstants.secret
      })
      request.user= tokenVerificada
      return true
    } catch (error) {      
       throw new UnauthorizedException()
      
    }

  }
}
