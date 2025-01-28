import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';


import { Request } from 'express';
import { ResetearContrasena } from './dto/resetar-contrasena.dto';
import { Types } from 'mongoose';
import { ValidacionIdPipe } from 'src/core/util/validacion-id/validacion-id.pipe';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('create')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get('listar')
  findAll() {
    return this.usuariosService.findAll();
  }

  
  @Get('perfil')
  perfil(@Req() request:Request) {       
    return this.usuariosService.perfil(request.user);
  }

  @Post('resetear/contrasena/:id')
  resetarContrasenaUsuario(@Body() resetearContrasena: ResetearContrasena, @Param('id',ValidacionIdPipe) id:Types.ObjectId) {
    return this.usuariosService.resetarContrasenaUsuario(resetearContrasena, id);
  }
  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  softDelete(@Param('id', new ValidacionIdPipe) id: string) {
    return this.usuariosService.softDelete(id);
  }
}
