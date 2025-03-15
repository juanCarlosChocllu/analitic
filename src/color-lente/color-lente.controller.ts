import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ColorLenteService } from './color-lente.service';
import { CreateColorLenteDto } from './dto/create-color-lente.dto';
import { UpdateColorLenteDto } from './dto/update-color-lente.dto';

@Controller('color-lente')
export class ColorLenteController {
  constructor(private readonly colorLenteService: ColorLenteService) {}

  @Post()
  create(@Body() createColorLenteDto: CreateColorLenteDto) {
    return this.colorLenteService.create(createColorLenteDto);
  }

  @Get()
  findAll() {
    return this.colorLenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colorLenteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColorLenteDto: UpdateColorLenteDto) {
    return this.colorLenteService.update(+id, updateColorLenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colorLenteService.remove(+id);
  }
}
