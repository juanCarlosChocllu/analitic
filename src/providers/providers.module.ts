import { Module } from '@nestjs/common';
import { HttpAxiosService } from './http.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports:[HttpModule],
  providers: [HttpAxiosService],
  exports:[HttpAxiosService]
})
export class ProvidersModule {}
