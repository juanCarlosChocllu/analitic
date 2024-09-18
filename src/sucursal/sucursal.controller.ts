import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SucursalService } from './sucursal.service';

@Controller()
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Get('sucursalExcel/:id')
  async sucursalExcel(@Param() id: string) {
    return await this.sucursalService.sucursalExcel(id);
  }
  @Post('sucursal/guardar')
  guardarEmpresaYsusSucursales (){
    return this.sucursalService.guardarEmpresaYsusSucursales()
  }
}
