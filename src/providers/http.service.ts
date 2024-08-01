import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { VentaExcelI } from 'src/venta/interfaces/ventaExcel.interface';
@Injectable()
export class HttpAxiosService {
  constructor(private readonly httpService:HttpService ){}

  public async reporte(){
   try {
    const date = new Date();
    const dia = date.getDate(); 
    const mes = date.getMonth() + 1; 
    const anio = date.getFullYear()-1;
    console.log(anio, '0'+mes, dia);
    
    const url = `https://comercial.opticentro.com.bo/cibeles${anio}0${mes}0${dia}.csv`;
    const response = await firstValueFrom(this.httpService.get(url))
    const venta = this.extracionDeInformacionValida(response.data)
    venta.shift() //elimina el primer elemento del array donde obtine los nombres de cada celda 
      return venta
   } catch (error) {
      const mensage=error.message.split(' ')
       if(mensage[5] == 404){
        throw new NotFoundException('Error no se encontro ningun archivo')
       }
   }
  }
  private extracionDeInformacionValida(data:any){
    const lineas:any[] = data.trim().split('\n');  
          
    const venta= lineas.map((linea)=>{
      const columnas = linea.split(';');
      const fechaCSV = columnas[0].split(' ');
      const resultado:VentaExcelI={
        fecha:fechaCSV[0],
        sucursal:columnas[3],
        numeroTicket:columnas[1],
        producto:columnas[12],
        cantidad:Number(columnas[19]),
        montoTotal:Number(columnas[28]),
      }
      return resultado
    })  
    return venta
  }

  

}
