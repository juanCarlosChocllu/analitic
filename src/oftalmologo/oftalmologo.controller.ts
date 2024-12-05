import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OftalmologoService } from './oftalmologo.service';
import { CreateOftalmologoDto } from './dto/create-oftalmologo.dto';
import { UpdateOftalmologoDto } from './dto/update-oftalmologo.dto';
import { BuscarOftalmologoDto } from './dto/buscador-oftalmologo.dto';

@Controller('oftalmologo')
export class OftalmologoController {
  constructor(private readonly oftalmologoService: OftalmologoService) {}

  @Post()
  create(@Body() createOftalmologoDto: CreateOftalmologoDto) {
    return this.oftalmologoService.create(createOftalmologoDto);
  }

  @Post('buscar')
  buscarOftalmologo(@Body() buscarOftalmologoDto: BuscarOftalmologoDto) {
    return this.oftalmologoService.buscarOftalmologo(buscarOftalmologoDto);
  }


  @Get()
  findAll() {
    return this.oftalmologoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.oftalmologoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOftalmologoDto: UpdateOftalmologoDto) {
    return this.oftalmologoService.update(+id, updateOftalmologoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.oftalmologoService.remove(+id);
  }
}
