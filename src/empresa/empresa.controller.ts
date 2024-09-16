import {
  Controller,
  Get,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}
  @Get()
  findAll() {
    return this.empresaService.findAll();
  }
}
