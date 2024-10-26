import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, usuariosSchema } from './schema/usuario.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Usuario.name,
          schema:usuariosSchema ,
        },
      ],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports:[UsuariosService]
})
export class UsuariosModule {}
