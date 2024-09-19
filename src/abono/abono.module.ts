import { forwardRef, Module } from '@nestjs/common';
import { AbonoService } from './abono.service';
import { AbonoController } from './abono.controller';
import { ProvidersModule } from 'src/providers/providers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Abono, AbonoSchema } from './schema/abono.abono';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { VentaModule } from 'src/venta/venta.module';

@Module({
  imports: [
    ProvidersModule,
    forwardRef(()=>VentaModule),
    
    MongooseModule.forFeature(
      [{ name: Abono.name, schema: AbonoSchema }],
      NombreBdConexion.oc,
    ),
  ],
  controllers: [AbonoController],
  providers: [AbonoService],

  exports: [AbonoService],
})
export class AbonoModule {}
