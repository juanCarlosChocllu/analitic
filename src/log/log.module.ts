import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, logSchema } from './schemas/log.schema';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';

@Module({
  imports:[
    MongooseModule.forFeature(
      [
        {
          name: Log.name,
          schema: logSchema,
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
