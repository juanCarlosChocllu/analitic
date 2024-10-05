import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NombreBdConexion } from 'src/enums/nombre.db.enum';
import { HttpAxiosVentaService } from 'src/providers/http.Venta.service';
import { diasDelAnio } from 'src/providers/util/dias.anio';
import { TipoLenteService } from 'src/tipo-lente/tipo-lente.service';
import { TipoVentaService } from 'src/tipo-venta/tipo-venta.service';
import { TratamientoService } from 'src/tratamiento/tratamiento.service';
import { productos } from 'src/venta/enums/productos.enum';
import { VentaExcelI } from 'src/venta/interfaces/ventaExcel.interface';

import { parseNumber } from 'src/venta/util/validar.numero.util';
import { dataEmpresa } from '../sucursal/data.empresas';
import { SuscursalExcel } from 'src/sucursal/schema/sucursal.schema';
import { EmpresaExcel } from 'src/empresa/schemas/empresa.schema';
import { AsesorExcel, VentaExcel } from 'src/venta/schemas/venta.schema';
import { Console, log } from 'node:console';
import { constants } from 'node:buffer';
import { MaterialService } from 'src/material/material.service';
import { TipoColorService } from 'src/tipo-color/tipo-color.service';
import { MarcasService } from 'src/marcas/marcas.service';
import { MarcaLenteService } from 'src/marca-lente/marca-lente.service';


@Injectable()
export class ReporteService {
  constructor(  

    @InjectModel(SuscursalExcel.name, NombreBdConexion.oc)
    private readonly sucursalExcelSchema: Model<SuscursalExcel>,

    
    @InjectModel(VentaExcel.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<VentaExcel>,
   
    @InjectModel(AsesorExcel.name, NombreBdConexion.oc)
    
    private readonly AsesorExcelSchema: Model<AsesorExcel>,
    
    private readonly httpAxiosVentaService: HttpAxiosVentaService,
      
    private readonly tratamientoService: TratamientoService,
    private readonly tipoLenteService: TipoLenteService,
    
    private readonly tipoVentaService: TipoVentaService,
        
    private readonly materialService: MaterialService,

    private readonly tipoColorService: TipoColorService,

    private readonly marcaService: MarcasService,
    private readonly marcaLenteService: MarcaLenteService,

  ){}
 
  async allExcel() {
    const aqo: number = 2023;
    const dataAnio = diasDelAnio(aqo);

     for (let data of dataAnio) {
     const [mes, dia] = data.split('-');
   
   //   const mes: string = '09';
   // const dia: string = '05';
   console.log(mes , dia, aqo);
    try {
      const dataExcel = await this.httpAxiosVentaService.reporte(mes, dia, aqo);
      const ventaSinServicio = this.quitarServiciosVentas(dataExcel);
      const ventaSinParaguay = this.quitarSucursalParaguay(ventaSinServicio);
      const ventaLimpia = this.quitarDescuento(ventaSinParaguay);
      
      await this.guardarAsesorExcel(ventaLimpia);
      await this.guardarAtributosLente(ventaLimpia);
      await this.guardarAtributosProductos(ventaLimpia)
      await this.guardaVentaLimpiaEnLaBBDD(ventaLimpia);
     
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log(
          `Archivo no encontrado para la fecha ${dia}/${mes}/${aqo}. Continuando con el siguiente día.`,
        );
         continue;
      } else {
        throw error;
      }
    }
   }

    return { status: HttpStatus.CREATED };
  }

  private quitarServiciosVentas(venta: VentaExcelI[]): VentaExcelI[] {
    const nuevaVenta = venta.filter((ventas) => ventas.producto !== 'SERVICIO');
    return nuevaVenta;
  }
  private quitarSucursalParaguay(venta: VentaExcelI[]): VentaExcelI[] {
    const nuevaVenta = venta.filter(
      (ventas) => ventas.sucursal !== 'OPTICENTRO PARAGUAY',
    );
    return nuevaVenta;
  }
  private quitarDescuento(venta: VentaExcelI[]) {
    const nuevaVenta = venta.filter((ventas) => ventas.cantidad !== -1);
    return nuevaVenta;
  }


  private async guardarAtributosLente(venta: VentaExcelI[]) {
    const lentes = venta.filter((item) => item.producto === 'LENTE');
    for (let data of lentes) {
      await this.tratamientoService.guardarTratamiento(data.atributo6.toUpperCase());
      await this.materialService.guardarMaterIal(data.atributo3.toUpperCase());
      await this.tipoLenteService.guardarTipoLente(data.atributo2.toUpperCase());
      await  this.tipoColorService.guardarTipoColor(data.atributo4.toUpperCase())
      await  this.marcaLenteService.guardarMarcaLente(data.atributo5.toUpperCase())
    }
  }

  protected async guardarAtributosProductos(venta: VentaExcelI[]){    
    
    const producto = venta.filter((item) => item.producto != productos.lente && item.producto != productos.descuento);
    for (let data of producto) {
        await this.marcaService.guardarMarcaProducto(data.atributo1.toUpperCase())
         
    }
  }


  private async guardaVentaLimpiaEnLaBBDD(Venta: VentaExcelI[]) {
 
    try {
      for (let data of Venta) {
        
        const textoTipo= data.numeroTicket.split('-')
 
        const  tipo = textoTipo[textoTipo.length - 2 ].toUpperCase()
       
          
          const sucursal = await this.sucursalExcelSchema.findOne({
          nombre: data.sucursal,
        });
    
        
        if (sucursal) {
          const asesor = await this.AsesorExcelSchema.findOne({
            usuario: data.asesor,
            sucursal: sucursal._id,
          });
    
          const tipoVenta = await this.tipoVentaService.tipoVentaAbreviatura(tipo);
          const tratamiento = data.producto === productos.lente? await this.tratamientoService.listarTratamiento( data.atributo6,): null;

          const tipoLente = data.producto === productos.lente  ? await this.tipoLenteService.listarTipoLente(data.atributo2):null          
         const material= data.producto === productos.lente ?await this.materialService.listarMaterial(data.atributo3):null;
         const tipoColor= data.producto === productos.lente ?await this.tipoColorService.listarTipoColor(data.atributo4):null;
          
         const marcaLente= data.producto === productos.lente ?await this.marcaLenteService.listarMarcaLente(data.atributo5):null;
      
         
         const marca= (data.producto === productos.montura  || data.producto === productos.gafa || data.producto === productos.lenteDeContacto) ?await this.marcaService.listarMarcaProducto(data.atributo1):null;
      
          
          try {
            const dataVenta = {
              fecha: data.fecha,
              sucursal: sucursal._id,
              empresa: sucursal.empresa,
              numeroTicket: data.numeroTicket,
              aperturaTicket: data.aperturaTicket,
              producto: data.producto,
              importe: parseNumber(data.importe),
              cantidad: data.cantidad,
              montoTotal: data.montoTotal,
              asesor: asesor._id,
              tipoVenta: tipoVenta._id,
              flagVenta: data.flagVenta,
              ...(data.producto === productos.lente && { tratamiento }),
              ...(data.producto === productos.lente && { tipoLente }),
              ...(data.producto === productos.lente && { material }),
              ...(data.producto === productos.lente && { tipoColor }),
              ...(data.producto === productos.lente && { marcaLente }),
              ...(data.producto === productos.montura && { marca }),
              ...(data.producto === productos.gafa && { marca }),
              ...(data.producto === productos.lenteDeContacto && { marca }),
            };
    
          
            await this.VentaExcelSchema.create(dataVenta);
          } catch (error) {
            throw error;
          }
        }
      }
    } catch (error) {
      console.log(error);

      throw new BadRequestException();
    }
  }





  private async guardarAsesorExcel(venta: VentaExcelI[]) {
    const data = venta.map((item) => ({
      asesor: item.asesor,
      sucursal: item.sucursal,
    }));

    const uniqueData = Array.from(
      new Map(data.map((item) => [item.asesor + item.sucursal, item])).values(),
    );

    for (let data of uniqueData) {
      const sucursal = await this.sucursalExcelSchema.findOne({
        nombre: data.sucursal,
      });

      if (sucursal) {
        const usuario = await this.AsesorExcelSchema.findOne({
          usuario: data.asesor,
          sucursal: sucursal._id,
        });

        if (!usuario) {
          await this.AsesorExcelSchema.create({
            usuario: data.asesor,
            sucursal: sucursal._id,
          });
        }
      }
    }
  }


    

}
