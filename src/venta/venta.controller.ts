import { Controller, Get, Post, Body, Patch, Param, Delete, Type, Query } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Types } from 'mongoose';
import { BusquedaVentaDto } from './dto/busqueda-venta.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  

  @Get(':id')
   async findAll(@Param('id') idSucursal:Types.ObjectId, @Query() busquedaVentaDto:BusquedaVentaDto ) { 
    return await this.ventaService.findAll(idSucursal, busquedaVentaDto);
  }



}
