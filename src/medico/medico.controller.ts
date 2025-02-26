import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicoService } from './medico.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { BuscadorMedicoDto } from './dto/BuscadorMedico.dto';

@Controller('medico')
export class MedicoController {
  constructor(private readonly medicoService: MedicoService) {}

 
 
   @Post('buscar')
   buscarOftalmologo(@Body() BuscadorMedicoDto: BuscadorMedicoDto) {
     return this.medicoService.buscarOftalmologo(BuscadorMedicoDto);
   }
 
}
