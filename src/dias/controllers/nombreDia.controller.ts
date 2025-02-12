import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { DiasService } from '../services/dias.service';
import { NombreDiaService } from '../services/nombreDia.service';
import { Types } from 'mongoose';
import { ValidacionIdPipe } from 'src/core/util/validacion-id/validacion-id.pipe';


@Controller('nombre/dia')
export class NombreDiaController {
  constructor(private readonly nombreDiaService: NombreDiaService) {}

  @Get()
  findAll() {
    return this.nombreDiaService.listarNombreDia();
  }

  
  @Delete(':id')
  delete(@Param('id', ValidacionIdPipe) id:Types.ObjectId) {
    return this.nombreDiaService.delete(id);
  }

}
