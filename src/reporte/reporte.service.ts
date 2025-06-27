import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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

import { SucursalService } from 'src/sucursal/sucursal.service';

import { Venta } from 'src/venta/schemas/venta.schema';
import { AsesoresService } from 'src/asesores/asesores.service';
import { AxiosError } from 'axios';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';
import { VentaI } from 'src/providers/interface/Venta';
import { Log } from 'src/log/schemas/log.schema';
import { ColorLenteService } from 'src/color-lente/color-lente.service';
import { MedicoService } from 'src/medico/medico.service';
import { LogService } from 'src/log/log.service';

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

    private readonly sucursalService: SucursalService,

    private readonly asesorService: AsesoresService,
    private readonly ventaService: VentaService,

    private readonly colorLenteService: ColorLenteService,
        private readonly logService:LogService
  ) {}

  async realizarDescarga(DescargarDto: DescargarDto) {
    try {
      const ventas = await this.httpServiceAxios.reporte(DescargarDto);

      await this.guardarAsesor(ventas),
        await this.guardarAtrubutosDeVenta(ventas),
        await this.guardaVenta(ventas);
        await this.logService.registroLogDescarga('Venta', DescargarDto.fechaFin)
      return { status: HttpStatus.CREATED };
    } catch (error) {
      throw error;
    }
  }

  private async guardarMedico(nombre: string, especialidad: string) {
    const medico = await this.medicoService.buscarMedico(
      nombre.trim().toUpperCase(),
    );
    if (!medico) {
      await this.medicoService.crearMedico(
        nombre.toUpperCase().trim(),
        especialidad.toUpperCase(),
      );
    }
  }

  private async guardarTipoVenta(tipo: string) {
    const tipoVenta = await this.tipoVentaService.verificarTipoVenta(
      tipo.trim().toUpperCase(),
    );
    if (!tipoVenta) {
      await this.tipoVentaService.registrarTipoVenta(tipo.toUpperCase().trim());
    }
  }

  private async guardarAtrubutosDeVenta(ventas: VentaI[]) {
    try {
      for (const venta of ventas) {
        await this.guardarMedico(venta.medico, venta.especialidad);
        await this.guardarTipoVenta(venta.tipoVenta);
        if (venta.rubro === productos.lente) {
          await this.guardarAtributosLente(
            venta.atributo1,
            venta.atributo2,
            venta.atributo3,
            venta.atributo4,
            venta.atributo5,
            venta.atributo6,
          );
        }
        if (
          venta.rubro != productos.lente &&
          venta.rubro != productos.servicio
        ) {
          await this.marcaService.guardarMarcaProducto(
            venta.atributo1.toUpperCase(),
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async guardarAtributosLente(
    atributo1: string,
    atributo2: string,
    atributo3: string,
    atributo4: string,
    atributo5: string,
    atributo6: string,
  ) {
    await Promise.all([
      this.colorLenteService.guardarColorLente(atributo1.toUpperCase()),
      this.tipoLenteService.guardarTipoLente(atributo2.toUpperCase()),
      this.materialService.guardarMaterIal(atributo3.toUpperCase()),
      this.tipoColorService.guardarTipoColor(atributo4.toUpperCase()),
      this.marcaLenteService.guardarMarcaLente(atributo5.toUpperCase()),
      this.tratamientoService.guardarTratamiento(atributo6.toUpperCase()),
    ]);
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
          const medico = await this.medicoService.buscarMedico(
            data.medico.trim().toUpperCase(),
          );
          const tipoVenta = await this.tipoVentaService.verificarTipoVenta(
            data.tipoVenta,
          );
          if (sucursal) {
            const asesor = await this.asesorService.buscarAsesorPorScursal(
              data.nombre_vendedor,
              sucursal._id,
            );

            const tratamiento =
              data.rubro === productos.lente
                ? await this.tratamientoService.listarTratamiento(
                    data.atributo6,
                  )
                : null;

            const tipoLente =
              data.rubro === productos.lente
                ? await this.tipoLenteService.listarTipoLente(data.atributo2)
                : null;
            const material =
              data.rubro === productos.lente
                ? await this.materialService.listarMaterial(data.atributo3)
                : null;
            const tipoColor =
              data.rubro === productos.lente
                ? await this.tipoColorService.listarTipoColor(data.atributo4)
                : null;

            const marcaLente =
              data.rubro === productos.lente
                ? await this.marcaLenteService.listarMarcaLente(data.atributo5)
                : null;
            const colorLente =
              data.rubro === productos.lente
                ? await this.colorLenteService.listarColorLente(data.atributo1)
                : null;
            const marca =
              data.rubro === productos.montura ||
              data.rubro === productos.gafa ||
              data.rubro === productos.lenteDeContacto
                ? await this.marcaService.listarMarcaProducto(data.atributo1)
                : null;
            const dataVenta = {
              ...(data.fecha_finalizacion && {
                fecha: new Date(data.fecha_finalizacion),
              }),
              fechaVenta: new Date(data.fecha),
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

              ...(data.rubro === productos.lente && { tratamiento }),
              ...(data.rubro === productos.lente && { tipoLente }),
              ...(data.rubro === productos.lente && { material }),
              ...(data.rubro === productos.lente && { tipoColor }),
              ...(data.rubro === productos.lente && { marcaLente }),
              ...(data.rubro === productos.lente && { colorLente }),
              ...(data.rubro === productos.montura && { marca }),
              ...(data.rubro === productos.gafa && { marca }),
              ...(data.rubro === productos.lenteDeContacto && { marca }),
            };
            await this.ventaService.crearVenta(dataVenta);
          }
        }
      }
    } catch (error) {
      throw new BadRequestException();
    }
  }

  private async guardarAsesor(venta: VentaI[]) {
    const data = venta.map((item) => ({
      asesor: item.nombre_vendedor.toUpperCase(),
      sucursal: item.local,
    }));

    const uniqueData = Array.from(
      new Map(data.map((item) => [item.asesor + item.sucursal, item])).values(),
    );

    for (let data of uniqueData) {
      const sucursal = await this.sucursalExcelSchema.findOne({
        nombre: data.sucursal,
      });

      if (sucursal) {
        const asesor = await this.asesorService.buscarAsesorPorScursal(
          data.asesor,
          sucursal._id,
        );

        if (!asesor) {
          await this.asesorService.crearAsesor(data.asesor, sucursal._id);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async descargaAutomaticaventas() {
    try {
      const date = new Date();
    const [año, mes, dia] = [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      (date.getDate() - 1).toString().padStart(2, '0'),
    ];
    const fecha: DescargarDto = {
      fechaInicio: `${año}-${mes}-${dia}`,
      fechaFin: `${año}-${mes}-${dia}`,
    };    
    this.logger.debug('Iniciando la descarga');
    const response = await this.realizarDescarga(fecha);
    console.log(response);
    
    } catch (error) {
        
    }
  }


 
    


}
