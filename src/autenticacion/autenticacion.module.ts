import { Module } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionController } from './autenticacion.controller';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/constants';
@Module({
  imports:[
    UsuariosModule,
    JwtModule.register({
      global:true,
      secret:jwtConstants.secret,
      signOptions: { expiresIn: '4h' },
    })
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],


})
export class AutenticacionModule {}
