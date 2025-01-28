import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogDescarga, logDescargaSchema, logSchema } from './schemas/log.schema';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Module({
  imports:[
    MongooseModule.forFeature(
      [
        {
          name: Log.name,
          schema: logSchema,
        },
        {
          name: LogDescarga.name,
          schema: logDescargaSchema,
        },
      ],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [LogController],
  providers: [LogService],
  exports:[LogService]
})
export class LogModule {}
