import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SucursalService } from './sucursal.service';

@Controller('sucursal')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}
  @Get()
  findAll() {
    return this.sucursalService.findAll();
  }

}
