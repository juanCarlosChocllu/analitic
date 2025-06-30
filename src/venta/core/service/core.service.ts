import { Injectable } from '@nestjs/common';
import { SucursalService } from 'src/sucursal/sucursal.service';

import { Types } from 'mongoose';
import { SucursalI } from 'src/core/interfaces/sucursalInterface';
import { VentaTodasDto } from '../dto/venta.todas.dto';
import { sucursalesEnum } from '../enums/sucursales.enum';
import { eachDayOfInterval, isSunday } from 'date-fns';

@Injectable()
export class CoreService {
  constructor(
    private readonly sucursalServiece: SucursalService,
    private readonly sucursalService: SucursalService,
  ) {}

  async filtroSucursal(sucursal: Types.ObjectId[]) {
    const sucursales: SucursalI[] = [];
    if (sucursal.length > 1) {
      for (const s of sucursal) {
        const su: SucursalI = await this.sucursalServiece.listarSucursalId(s);

        if (su.nombre !== 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        }
      }
    } else if (sucursal.length == 1) {
      for (const s of sucursal) {
        const su: SucursalI = await this.sucursalServiece.listarSucursalId(s);
        if (su.nombre == 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        } else {
          sucursales.push(su);
        }
      }
    }
    return sucursales;
  }

  async filtroParaTodasEmpresas(
    ventaTodasDto: VentaTodasDto,
  ): Promise<SucursalI[]> {
    /// devuelve todas las scursales cuando se le aplica todas
    let sucursales: SucursalI[] = [];

    if (
      ventaTodasDto.empresa.length > 0 &&
      ventaTodasDto.sucursal.length == 0
    ) {
      for (const empresa of ventaTodasDto.empresa) {
        const sucursal = await this.sucursalService.sucursalListaEmpresas(
          new Types.ObjectId(empresa),
        );
        sucursales.push(
          ...sucursal.filter(
            (item) => item.nombre !== sucursalesEnum.opticentroParaguay,
          ),
        );
      }
    } else {
      for (const sucursal of ventaTodasDto.sucursal) {
        const sucur = await this.sucursalService.listarSucursalId(sucursal);
        sucursales.push(sucur);
      }
    }
    return sucursales;
  }

  cantidadDias(fechaInicio: string, fechaFin: string): Date[] {
    const fecha1 = new Date(fechaInicio);
    fecha1.setUTCDate(fecha1.getUTCDate() + 1);
    const fecha2 = new Date(fechaFin);
    fecha2.setUTCDate(fecha2.getUTCDate() + 1);
    const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });
    return dias;
  }

  reglaDeTresSimple(diasComerciales: number, diasHabiles: number): number {
    if (diasComerciales <= 0 || diasHabiles <= 0) {
      return 0;
    }
    const indice = (diasHabiles * 100) / diasComerciales;
    return Math.round(indice);
  }

  cantidadDomingos(fechaInicio: string, fechaFin: string) {
    const fecha1 = new Date(fechaInicio);
    fecha1.setUTCDate(fecha1.getUTCDate() + 1);
    const fecha2 = new Date(fechaFin);
    fecha2.setUTCDate(fecha2.getUTCDate() + 1);
    const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });
    const domingos = dias.filter((dia) => isSunday(dia));
    return domingos.length;
  }
}
