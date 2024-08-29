import { Module } from '@nestjs/common';
import { HttpAxiosVentaService} from './http.Venta.service';
import {  HttpAxiosAbonoService} from './http.Abono.service';

import { HttpModule } from '@nestjs/axios';
@Module({
  imports:[HttpModule],

  providers: [HttpAxiosVentaService, HttpAxiosAbonoService],

  exports:[HttpAxiosAbonoService, HttpAxiosVentaService]

})
export class ProvidersModule {}
