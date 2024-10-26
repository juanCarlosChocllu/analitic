import { Controller, Get, UseGuards } from '@nestjs/common';
import { TipoVentaService } from './tipo-venta.service';
import { TokenGuard } from 'src/autenticacion/guard/token/token.guard';


@Controller('tipo/venta')
export class TipoVentaController {
  constructor(private readonly tipoVentaService: TipoVentaService) {}
  @Get('guardar')
  guardarTipoVenta() {
    return this.tipoVentaService.guardarTipoVenta();
  }

  @Get('listar')
  listarTipoVenta(){
    return this.tipoVentaService.listarTipoVenta();
  }
}
