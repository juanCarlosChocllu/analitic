import { Module } from '@nestjs/common';
import { HttpAxiosVentaService } from './http.Venta.service';
import { HttpAxiosAbonoService } from './http.Abono.service';

import { LogModule } from 'src/log/log.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule, LogModule],

  providers: [HttpAxiosVentaService, HttpAxiosAbonoService],

  exports: [HttpAxiosAbonoService, HttpAxiosVentaService],
})
export class ProvidersModule {}
