import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor( private readonly usuariosService:UsuariosService){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
     

    return true;
  }
}
