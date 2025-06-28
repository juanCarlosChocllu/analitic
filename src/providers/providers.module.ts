import { Module } from '@nestjs/common';
import { HttpServiceAxios } from './httpService';
import { HttpAxiosAbonoService } from './http.Abono.service';

import { LogModule } from 'src/log/log.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule, LogModule],

  providers: [HttpServiceAxios, HttpAxiosAbonoService],

  exports: [HttpAxiosAbonoService, HttpServiceAxios],
})
export class ProvidersModule {}
