import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HttpAxiosVentaService } from 'src/providers/http.Venta.service';
import { TipoLenteService } from 'src/tipo-lente/tipo-lente.service';
import { TipoVentaService } from 'src/tipo-venta/tipo-venta.service';
import { TratamientoService } from 'src/tratamiento/tratamiento.service';
import { productos } from 'src/venta/core/enums/productos.enum';
import { VentaExcelI } from 'src/venta/core/interfaces/ventaExcel.interface';

import { parseNumber } from 'src/venta/core/util/validar.numero.util';

import { SuscursalExcel } from 'src/sucursal/schema/sucursal.schema';


import { MaterialService } from 'src/material/material.service';
import { TipoColorService } from 'src/tipo-color/tipo-color.service';
import { MarcasService } from 'src/marcas/marcas.service';
import { MarcaLenteService } from 'src/marca-lente/marca-lente.service';
import { FechaDto } from './dto/fecha.dto';
import { fechasArray } from './util/fecha.array.util';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ventaInformacionRI } from './interface/ventaInformacion.interface';
import { VentaService } from 'src/venta/services/venta.service';
import { OftalmologoService } from 'src/oftalmologo/oftalmologo.service';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { Log } from 'src/log/schemas/log.schema';
import { AsesorExcel } from 'src/asesores/schemas/asesore.schema';
import { VentaExcel } from 'src/venta/schemas/venta.schema';
import { AsesoresService } from 'src/asesores/asesores.service';
import { AxiosError } from 'axios';
import { NombreBdConexion } from 'src/core/enums/nombre.db.enum';


@Injectable()
export class ReporteService {

    private readonly logger = new Logger(ReporteService.name)

  constructor(  

    @InjectModel(SuscursalExcel.name, NombreBdConexion.oc)
    private readonly sucursalExcelSchema: Model<SuscursalExcel>,

    
    @InjectModel(VentaExcel.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<VentaExcel>,
    
    private readonly httpAxiosVentaService: HttpAxiosVentaService,
      
    private readonly tratamientoService: TratamientoService,
    private readonly tipoLenteService: TipoLenteService,
    
    private readonly tipoVentaService: TipoVentaService,
        
    private readonly materialService: MaterialService,

    private readonly tipoColorService: TipoColorService,

    private readonly marcaService: MarcasService,

    private readonly marcaLenteService: MarcaLenteService,

    private readonly ventaService:VentaService,

    private readonly oftalmologoService:OftalmologoService,

    private readonly sucursalService:SucursalService,

    private readonly asesorService:AsesoresService,
    
  ){}
 
  async allExcel(fechaDto:FechaDto) { 
    console.log(fechaDto);
       
    const diasFechasArray:Date[] | String[] = fechasArray(fechaDto.fechaInicio, fechaDto.fechaFin)    
    for(let fecha of diasFechasArray){
  
      const[aqo, mes, dia]= [fecha.getFullYear(), (fecha.getMonth() + 1).toString().padStart(2, '0') ,  fecha.getDate().toString().padStart(2, '0') ]
   
    try {
     const dataExcel = await this.httpAxiosVentaService.reporte(mes, dia, aqo);
     
      const ventaSinServicio = this.quitarServiciosVentas(dataExcel);
     // const ventaSinParaguay = this.quitarSucursalParaguay(ventaSinServicio);
      const ventaLimpia = this.quitarDescuento(ventaSinServicio);
      console.log('descargando de :' , aqo, mes, dia);
      await this.guardarAsesorExcel(ventaLimpia);
      await this.guardarAtributosLente(ventaLimpia);
      await this.guardarAtributosProductos(ventaLimpia)
      await this.guardaVentaLimpiaEnLaBBDD(ventaLimpia);

    } catch (error) {
      console.log(error);
      
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
        const venta = await this.VentaExcelSchema.exists({
          numeroTicket: data.numeroTicket.toUpperCase(),
          producto: data.producto,     
        });      
      
        if(!venta){
        const textoTipo= data.numeroTicket.split('-')
 
        const  tipo = textoTipo[textoTipo.length - 2 ].toUpperCase()
                 const sucursal = await this.sucursalExcelSchema.findOne({
          nombre: data.sucursal,
        });
    
        
        if (sucursal) {
          const asesor = await this.asesorService.buscarAsesorPorScursal(data.asesor, sucursal._id)
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
              numeroTicket: data.numeroTicket.toUpperCase().trim(),
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
      
      }
    } catch (error) {


      throw new BadRequestException();
    }
  }





  private async guardarAsesorExcel(venta: VentaExcelI[]) {
    const data = venta.map((item) => ({
      asesor: item.asesor.toUpperCase(),
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
        const asesor = await this.asesorService.buscarAsesorPorScursal(data.asesor, sucursal._id)

        if (!asesor) {
          await this.asesorService.crearAsesor(data.asesor, sucursal._id)
        }
      }
    }
  }


@Cron(CronExpression.EVERY_DAY_AT_4AM)
 async  descargaAutomaticaventas(){
    const date = new Date()
    const[año, mes, dia]= [date.getFullYear(), (date.getMonth() + 1).toString().padStart(2, '0') , (date.getDate() - 2).toString().padStart(2, '0')  ]
    const fecha:FechaDto={
      fechaInicio: `${año}-${mes}-${dia}`,
      fechaFin:`${año}-${mes}-${dia}`
    }
    this.logger.debug('Iniciando la descarga');
    const response = await this.allExcel(fecha)
    if(response.status == HttpStatus.CREATED){
      this.logger.debug('Descarga completada');
    }else{
      this.logger.debug('Descarga fallida');
    }
  }

  async informacionRestanteVenta(fechaDto:FechaDto){
    try {
          const response:ventaInformacionRI[]= await this.httpAxiosVentaService.informacionRestanteVenta(fechaDto.fechaInicio, fechaDto.fechaFin )
          for(let ve of response){ 
              const venta = await this.ventaService.findOneNumeroTickectVenta(ve.id_venta)
              if(venta){
               
                if (ve.sucursal === 'SUCRE - CENTRAL'){
                  ve.sucursal = 'SUCRE  CENTRAL'
                }
                const sucursal = await this.sucursalService.buscarSucursal(ve.sucursal.toUpperCase())
                   
                 if(sucursal){
                  const oftalmologo= await this.oftalmologoService.findOneOftalmologo(ve.oftalmologo.toUpperCase().trim())   
                  if(!oftalmologo ){

                    const of =  await this.oftalmologoService.crearOftalmologo(ve.oftalmologo.toUpperCase().trim(), ve.especialidad.toUpperCase(),sucursal._id)
                      await this.ventaService.guardarVentaInformacionRestante(venta.numeroTicket, ve.comisiona, of._id)
             
                   }else{
                     await this.ventaService.guardarVentaInformacionRestante(venta.numeroTicket, ve.comisiona, oftalmologo._id)
                     
                   }
                 }
              } 
          }
          return {status:HttpStatus.OK}
        
        } catch (error) {
          const e = error as AxiosError
          if(e.response.status == HttpStatus.UNAUTHORIZED){
             throw new UnauthorizedException()
          }
          throw new BadRequestException(error)
          
    }

  }
    

}
