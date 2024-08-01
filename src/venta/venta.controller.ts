import { Controller, Get, Post, Body, Patch, Param, Delete, Type, Query, UseInterceptors } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaDto, VentaExcelDto } from './dto/venta.dto';
import { VentaExcel } from './schemas/venta.schema';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}


 /* @Post('actual')
   async actual(@Body() ventaDto:VentaDto) { 
     return await this.ventaService.findAll(ventaDto);
  }
  @Post('anterior')
  async anterio(@Body() ventaDto:VentaDto) { 
    return await this.ventaService.findAll(ventaDto);
  }*/
  @Post('excel/actual')
   async ventaExcelActual(@Body() ventaDto:VentaExcelDto) { 
     return await this.ventaService.ventaExel(ventaDto);
  }

  @Post('excel/anterior')
  async ventaExcelAnterior(@Body() ventaDto:VentaExcelDto) { 
    return await this.ventaService.ventaExel(ventaDto);
 }


 @Post('reporte')
 async  allExcel() { 
   return await this.ventaService.allExcel();
}
@Get('sucursalEcel')
async  sucursalExcel() { 
  return await this.ventaService.sucursalExcel();
}
 

}
