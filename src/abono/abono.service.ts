import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpAxiosAbonoService } from 'src/providers/http.Abono.service';
import { diasDelAnio } from 'src/providers/util/dias.anio';
import { Abono } from './schema/abono.abono';
import { Model, Types } from 'mongoose';

import { abonoI } from './interfaces/abono.interface';
import { VentaService } from 'src/venta/services/venta.service';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';

@Injectable()
export class AbonoService {
  constructor(
    @InjectModel(Abono.name, NombreBdConexion.oc)
    private readonly AbonoSchema: Model<Abono>,

    
  ) {}



  
}
