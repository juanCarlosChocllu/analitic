import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OftalmologoService } from './oftalmologo.service';
import { CreateOftalmologoDto } from './dto/create-oftalmologo.dto';
import { UpdateOftalmologoDto } from './dto/update-oftalmologo.dto';
import { BuscarOftalmologoDto } from './dto/buscador-oftalmologo.dto';

@Controller('oftalmologo')
export class OftalmologoController {
  constructor(private readonly oftalmologoService: OftalmologoService) {}



  @Post('buscar')
  buscarOftalmologo(@Body() buscarOftalmologoDto: BuscarOftalmologoDto) {
    return this.oftalmologoService.buscarOftalmologo(buscarOftalmologoDto);
  }


 
}
