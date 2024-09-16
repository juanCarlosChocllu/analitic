import { Controller, Get } from '@nestjs/common';
import { TipoVentaService } from './tipo-venta.service';

@Controller('tipo-venta')
export class TipoVentaController {
  constructor(private readonly tipoVentaService: TipoVentaService) {}
  @Get()
  findAll() {
    return this.tipoVentaService.findAll();
  }
}
