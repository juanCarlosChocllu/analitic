import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { HttpServiceAxios } from 'src/providers/httpService';
import { TipoLenteService } from 'src/tipo-lente/tipo-lente.service';
import { TipoVentaService } from 'src/tipo-venta/tipo-venta.service';
import { TratamientoService } from 'src/tratamiento/tratamiento.service';
import { productos } from 'src/venta/core/enums/productos.enum';

import { Sucursal } from 'src/sucursal/schema/sucursal.schema';

import { MaterialService } from 'src/material/material.service';
import { TipoColorService } from 'src/tipo-color/tipo-color.service';
import { MarcasService } from 'src/marcas/marcas.service';
import { MarcaLenteService } from 'src/marca-lente/marca-lente.service';
import { DescargarDto } from './dto/Descargar.dto';

import { Cron, CronExpression } from '@nestjs/schedule';
import { VentaService } from 'src/venta/services/venta.service';

import { Venta } from 'src/venta/schemas/venta.schema';
import { AsesoresService } from 'src/asesores/asesores.service';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { VentaI } from 'src/providers/interface/Venta';

import { ColorLenteService } from 'src/color-lente/color-lente.service';
import { MedicoService } from 'src/medico/medico.service';
import { LogService } from 'src/log/log.service';
import { RecetaService } from 'src/receta/receta.service';
import { RecetaI, RecetaResponseI } from 'src/receta/interface/receta';
import { horaUtc } from 'src/core/util/fechas/horaUtc';
import { AnularVentaDto } from './dto/AnularVenta.dto';
import { RangosService } from 'src/rangos/rangos.service';
import { log } from 'node:console';

@Injectable()
export class ReporteService {
  private readonly logger = new Logger(ReporteService.name);

  constructor(
    @InjectModel(Sucursal.name, NombreBdConexion.oc)
    private readonly sucursalExcelSchema: Model<Sucursal>,

    @InjectModel(Venta.name, NombreBdConexion.oc)
    private readonly venta: Model<Venta>,

    private readonly httpServiceAxios: HttpServiceAxios,

    private readonly tratamientoService: TratamientoService,
    private readonly tipoLenteService: TipoLenteService,

    private readonly tipoVentaService: TipoVentaService,

    private readonly materialService: MaterialService,

    private readonly tipoColorService: TipoColorService,

    private readonly marcaService: MarcasService,

    private readonly marcaLenteService: MarcaLenteService,

    private readonly medicoService: MedicoService,

    private readonly asesorService: AsesoresService,
    private readonly ventaService: VentaService,

    private readonly colorLenteService: ColorLenteService,
    private readonly logService: LogService,
    private readonly recetaService: RecetaService,
    private readonly rangoService: RangosService,
  ) {}

  async realizarDescarga(DescargarDto: DescargarDto) {
    try {
      const ventas = await this.httpServiceAxios.reporte(DescargarDto);
      await this.guardaVenta(ventas);
      await this.logService.registroLogDescarga('Venta', DescargarDto.fechaFin);
      return { status: HttpStatus.CREATED };
    } catch (error) {
      throw error;
    }
  }

  private async guardaVenta(ventas: VentaI[]) {
    try {
      for (let data of ventas) {
        const venta = await this.venta.exists({
          numeroTicket: data.idVenta.toUpperCase(),
          producto: data.rubro,
        });

        if (!venta) {
          const sucursal = await this.sucursalExcelSchema.findOne({
            nombre: data.local,
          });
          const medico = await this.medicoService.crearMedico(
            data.medico.trim().toUpperCase(),
            data.especialidad,
          );
          const tipoVenta = await this.tipoVentaService.verificarTipoVenta(
            data.tipoVenta,
          );
          if (sucursal) {
            const asesor = await this.asesorService.crearAsesor(
              data.nombre_vendedor,
              sucursal._id,
            );

            if (data.rubro === productos.lente) {
              await this.registarLente(
                data,
                sucursal._id,
                sucursal.empresa,
                asesor._id,
                tipoVenta._id,
                medico._id,
              );
            } else if (
              data.rubro === productos.lenteDeContacto ||
              data.rubro === productos.montura ||
              data.rubro === productos.gafa
            ) {
              await this.guardarProducto(
                data,
                sucursal._id,
                sucursal.empresa,
                asesor._id,
                tipoVenta._id,
                medico._id,
              );
            } else {
              const dataVenta = {
                ...(data.fecha_finalizacion && {
                  fecha: horaUtc(data.fecha_finalizacion),
                }),
                fechaVenta: horaUtc(data.fecha),
                tipoConversion: data.tipoConversion,
                descuentoFicha: data.descuentoFicha,
                comisiona: data.comisiona,
                numeroCotizacion: data.numeroCotizacion,
                cotizacion: data.cotizacion,
                estadoTracking: data.estadoTracking,
                sucursal: sucursal._id,
                empresa: sucursal.empresa,
                numeroTicket: data.idVenta.toUpperCase().trim(),
                aperturaTicket: data.apertura_tkt,
                producto: data.rubro,
                importe: data.importe,
                cantidad: data.cantidad,
                montoTotal: data.monto_total,
                asesor: asesor._id,
                tipoVenta: tipoVenta._id,
                medico: medico._id,
                flagVenta: data.flag,
                descripcion: data.descripcionProducto,
              };
              await this.ventaService.crearVenta(dataVenta);
            }
          }
        }
      }
    } catch (error) {
      console.log(error);

      throw new BadRequestException();
    }
  }

  private async guardarProducto(
    data: VentaI,
    sucursal: Types.ObjectId,
    empresa: Types.ObjectId,
    asesor: Types.ObjectId,
    tipoVenta: Types.ObjectId,
    medico: Types.ObjectId,
  ) {
    const marca = await this.marcaService.guardarMarcaProducto(data.atributo1);
    console.log(data.atributo1);

    console.log(data.rubro);
    console.log(marca);

    const dataVenta = {
      ...(data.fecha_finalizacion && {
        fecha: horaUtc(data.fecha_finalizacion),
      }),
      fechaVenta: horaUtc(data.fecha),
      tipoConversion: data.tipoConversion,
      descuentoFicha: data.descuentoFicha,
      comisiona: data.comisiona,
      numeroCotizacion: data.numeroCotizacion,
      cotizacion: data.cotizacion,
      estadoTracking: data.estadoTracking,
      sucursal: sucursal,
      empresa: empresa,
      numeroTicket: data.idVenta.toUpperCase().trim(),
      aperturaTicket: data.apertura_tkt,
      producto: data.rubro,
      importe: data.importe,
      cantidad: data.cantidad,
      montoTotal: data.monto_total,
      asesor: asesor._id,
      tipoVenta: tipoVenta._id,
      medico: medico._id,
      flagVenta: data.flag,
      marca: marca._id,
      descripcion: data.descripcionProducto,
    };
    await this.ventaService.crearVenta(dataVenta);
  }

  private async registarLente(
    data: VentaI,
    sucursal: Types.ObjectId,
    empresa: Types.ObjectId,
    asesor: Types.ObjectId,
    tipoVenta: Types.ObjectId,
    medico: Types.ObjectId,
  ) {
    const [
      tratamiento,
      tipoLente,
      material,
      tipoColor,
      marcaLente,
      colorLente,
      rango,
      receta,
    ] = await Promise.all([
      this.tratamientoService.guardarTratamiento(data.atributo6),
      this.tipoLenteService.guardarTipoLente(data.atributo2),
      this.materialService.guardarMaterIal(data.atributo3),
      this.tipoColorService.guardarTipoColor(data.atributo4),
      this.marcaLenteService.guardarMarcaLente(data.atributo5),
      this.colorLenteService.guardarColorLente(data.atributo1),
      this.rangoService.guardarRango(data.atributo7),
      this.registrarReceta(data.receta, medico),
    ]);

    const dataVenta = {
      ...(data.fecha_finalizacion && {
        fecha: horaUtc(data.fecha_finalizacion),
      }),
      fechaVenta: horaUtc(data.fecha),
      tipoConversion: data.tipoConversion,
      descuentoFicha: data.descuentoFicha,
      comisiona: data.comisiona,
      numeroCotizacion: data.numeroCotizacion,
      cotizacion: data.cotizacion,
      estadoTracking: data.estadoTracking,
      sucursal: sucursal,
      empresa: empresa,
      numeroTicket: data.idVenta.toUpperCase().trim(),
      aperturaTicket: data.apertura_tkt,
      producto: data.rubro,
      importe: data.importe,
      cantidad: data.cantidad,
      montoTotal: data.monto_total,
      asesor: asesor,
      tipoVenta: tipoVenta,
      medico: medico,
      flagVenta: data.flag,
      descripcion: data.descripcionProducto,
      tratamiento: tratamiento._id,
      tipoLente: tipoLente._id,
      material: material._id,
      tipoColor: tipoColor._id,
      marcaLente: marcaLente._id,
      colorLente: colorLente._id,
      rango: rango._id,
      receta: receta._id,
    };
    await this.ventaService.crearVenta(dataVenta);
  }

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async descargaAutomaticaventas() {
    try {
      const date = new Date();

      const fechaAyer = new Date(date);
      fechaAyer.setDate(date.getDate() - 1);

      const año = fechaAyer.getFullYear();
      const mes = (fechaAyer.getMonth() + 1).toString().padStart(2, '0');
      const dia = fechaAyer.getDate().toString().padStart(2, '0');

      const fecha: DescargarDto = {
        fechaInicio: `${año}-${mes}-${dia}`,
        fechaFin: `${año}-${mes}-${dia}`,
      };
      this.logger.debug('Iniciando la descarga ventas');
      const response = await this.realizarDescarga(fecha);
      console.log(fecha);
    } catch (error) {}
  }

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async descargaRecetas() {
    try {
      const date = new Date();

      const fechaAyer = new Date(date);
      fechaAyer.setDate(date.getDate() - 1);

      const año = fechaAyer.getFullYear();
      const mes = (fechaAyer.getMonth() + 1).toString().padStart(2, '0');
      const dia = fechaAyer.getDate().toString().padStart(2, '0');

      const fecha: DescargarDto = {
        fechaInicio: `${año}-${mes}-${dia}`,
        fechaFin: `${año}-${mes}-${dia}`,
      };

      this.logger.debug('Iniciando la descarga recetas');
      const response = await this.descargarReceta(fecha);
      console.log(fecha);
    } catch (error) {
      console.log(error);
    }
  }

  async descargarReceta(descargarDto: DescargarDto) {
    const receta = await this.httpServiceAxios.descargarReceta(descargarDto);
    for (const data of receta) {
      console.log(data.especialidad);

      const [medico, receta] = await Promise.all([
        this.medicoService.verificarMedico(data.medico, data.especialidad),
        this.recetaService.buscarReceta(data.codigoMia),
      ]);

      if (!receta) {
        const nuevaReceta: RecetaI = {
          ...data,
          fecha: horaUtc(data.fecha),
          medico: new Types.ObjectId(medico._id),
        };
        await this.recetaService.registrarReceta(nuevaReceta);
      }
    }
  }

  async actualizarVentas(fechaDto: DescargarDto) {
    const ventas = await this.httpServiceAxios.reporte(fechaDto);
    for (const venta of ventas) {
      const ven = await this.venta.findOne({
        numeroTicket: venta.idVenta.trim(),
        flagVenta: { $ne: 'FINALIZADO' },
      });
      if (ven) {
        await this.venta.updateMany(
          { numeroTicket: venta.idVenta.trim() },
          {
            ...(venta.fecha_finalizacion && {
              fecha: horaUtc(venta.fecha_finalizacion),
            }),
            estadoTracking: venta.estadoTracking,
            flagVenta: venta.flag,
          },
        );
      }
    }
  }

  async actulizarFechas(fechaDto: DescargarDto) {
    const ventas = await this.httpServiceAxios.reporte(fechaDto);
    for (const venta of ventas) {
      const ventaEncotrada = await this.venta
        .findOne({ numeroTicket: venta.idVenta.trim(), producto: venta.rubro })
        .lean();
      if (ventaEncotrada) {
        const fecha = horaUtc(venta.fecha);

        await this.venta.updateOne(
          { numeroTicket: venta.idVenta.trim(), producto: venta.rubro },
          {
            $set: {
              fechaVenta: fecha,
              ...(venta.fecha_finalizacion && {
                fecha: horaUtc(venta.fecha_finalizacion),
                flagVenta: venta.flag,
              }),
            },
          },
        );
      } else {
        console.log(venta);
      }
    }
  }

  async anularVenta(anularVentaDto: AnularVentaDto) {
    console.log(anularVentaDto);

    const venta = await this.venta.find({
      numeroTicket: anularVentaDto.idVenta,
    });
    console.log(venta);

    if (venta.length > 0) {
      await this.venta.updateMany(
        { numeroTicket: anularVentaDto.idVenta },
        {
          estado: anularVentaDto.estado,
          estadoTracking: anularVentaDto.estadoTracking,
          fechaAnulacion: horaUtc(anularVentaDto.fechaAnulacion),
        },
      );
      return { status: HttpStatus.OK };
    }
    throw new NotFoundException();
  }

  async anularVentas(fechaDto: DescargarDto) {
    const ventasMia = await this.httpServiceAxios.anularVentas(fechaDto);
    for (const venta of ventasMia) {
      const ventaAnalitycs = await this.venta.findOne({
        numeroTicket: venta.id_venta,
        estadoTracking: { $ne: 'ANULADO' },
      });
      if (ventaAnalitycs) {
        await this.venta.updateMany(
          { numeroTicket: venta.id_venta },
          {
            estado: venta.estado,
            estadoTracking: venta.estadoTracking,
            fechaAnulacion: horaUtc(venta.fechaAprobacionAnulacion),
          },
        );
      }
    }

    return { status: HttpStatus.OK };
  }

  async finalizarVentasMia(fechaDto: DescargarDto) {
    const ventasMia = await this.httpServiceAxios.finalizarVentasMia(fechaDto);
    for (const venta of ventasMia) {
      const ventaAnalitycs = await this.venta.findOne({
        numeroTicket: venta.id_venta,
      });
      if (ventaAnalitycs) {
        await this.venta.updateMany(
          {
            numeroTicket: venta.id_venta,
          },
          {
            estado: venta.estado,
            estadoTracking: venta.estadoTracking,
            flagVenta: venta.flaVenta,
            fecha: horaUtc(venta.fecha_finalizacion),
          },
        );
      }
    }
    return { status: HttpStatus.OK };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async anularVentasCron() {
    try {
      const hoy = new Date();
      const fechaFinDate = new Date(hoy);
      fechaFinDate.setDate(hoy.getDate() - 1);

      const fechaInicioDate = new Date(hoy);
      fechaInicioDate.setDate(hoy.getDate() - 5);

      const formatearFecha = (fecha: Date): string => {
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${año}-${mes}-${dia}`;
      };

      const fecha: DescargarDto = {
        fechaInicio: formatearFecha(fechaInicioDate),
        fechaFin: formatearFecha(fechaFinDate),
      };

      this.logger.debug('Iniciando la anulaciones');
      const response = await this.anularVentas(fecha);
      console.log(fecha);
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async finalizarVentasCron() {
    try {
      const hoy = new Date();
      const fechaFinDate = new Date(hoy);
      fechaFinDate.setDate(hoy.getDate() - 1);

      const fechaInicioDate = new Date(hoy);
      fechaInicioDate.setDate(hoy.getDate() - 2);

      const formatearFecha = (fecha: Date): string => {
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${año}-${mes}-${dia}`;
      };

      const fecha: DescargarDto = {
        fechaInicio: formatearFecha(fechaInicioDate),
        fechaFin: formatearFecha(fechaFinDate),
      };
      this.logger.debug('Iniciando finalizaciones');
      console.log(fecha);

      const response = await this.finalizarVentasMia(fecha);
    } catch (error) {
      console.log(error);
    }
  }

  private async registrarReceta(
    receta: RecetaResponseI,
    medico: Types.ObjectId,
  ) {
    const recetaExistente = await this.recetaService.buscarReceta(
      receta.codigoMia,
    );

    if (!recetaExistente) {
      const nuevaReceta: RecetaI = {
        ...receta,
        fecha: horaUtc(receta.fecha),
        medico: new Types.ObjectId(medico),
      };

      return this.recetaService.registrarReceta(nuevaReceta);
    }
    return recetaExistente;
  }
}
