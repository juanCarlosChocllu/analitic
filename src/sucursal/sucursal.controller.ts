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
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ValidacionIdPipe } from 'src/core/util/validacion-id/validacion-id.pipe';
import { Public } from 'src/autenticacion/decorators/public.decorator';


@Controller()
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Get('sucursalExcel/:id')
  async sucursalExcel(@Param('id', ValidacionIdPipe) id: string) {
    return await this.sucursalService.sucursalListaEmpresas(new Types.ObjectId(id));
  }

  @Post('sucursal/guardar')
  guardarEmpresaYsusSucursales (){
    return this.sucursalService.guardarEmpresaYsusSucursales()
  }

  

  @Public()
  @Post('sucursal/guardarSucursal')
  guardarSucursal (@Body() body: { empresa: string; sucursal: string }) {
    return this.sucursalService.guardarSucursal(body.empresa, body.sucursal);
  }
}

