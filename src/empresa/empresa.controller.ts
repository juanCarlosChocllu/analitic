import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { TokenGuard } from 'src/autenticacion/guard/token/token.guard';


@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}
  @Get()
  async empresaExcel() {
    return await this.empresaService.EmpresaExcel();
  }

}
