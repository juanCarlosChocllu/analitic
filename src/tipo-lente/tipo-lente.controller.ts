import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TipoLenteService } from './tipo-lente.service';

@Controller('tipo-lente')
export class TipoLenteController {
  constructor(private readonly tipoLenteService: TipoLenteService) {}
}
