import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsesoresService } from './asesores.service';
import { CreateAsesoreDto } from './dto/create-asesore.dto';
import { UpdateAsesoreDto } from './dto/update-asesore.dto';

@Controller('asesores')
export class AsesoresController {
  constructor(private readonly asesoresService: AsesoresService) {}

  @Post()
  create(@Body() createAsesoreDto: CreateAsesoreDto) {
    return this.asesoresService.create(createAsesoreDto);
  }

  @Get()
  findAll() {
    return this.asesoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asesoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAsesoreDto: UpdateAsesoreDto) {
    return this.asesoresService.update(+id, updateAsesoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asesoresService.remove(+id);
  }
}
