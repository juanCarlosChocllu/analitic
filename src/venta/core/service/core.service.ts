import { Injectable } from "@nestjs/common";
import { SucursalService } from "src/sucursal/sucursal.service";

import { Types } from "mongoose";
import { SucursalI } from "src/core/interfaces/sucursalInterface";
import { VentaTodasDto } from "../dto/venta.todas.dto";
import { sucursalesEnum } from "../enums/sucursales.enum";

@Injectable()
export class CoreService{
    
    constructor (   private readonly sucursalServiece: SucursalService,       
       private readonly sucursalService: SucursalService,){}

    async filtroSucursal(sucursal: Types.ObjectId[]) {
      
        
        const sucursales: SucursalI[] = [];
        if (sucursal.length > 1) {
          for (const s of sucursal) {      
            const su:SucursalI = await this.sucursalServiece.listarSucursalId(s);
     
            
            if (su.nombre !== 'OPTICENTRO PARAGUAY') {
              sucursales.push(su);
            }
          }
        } else if (sucursal.length == 1) {
          for (const s of sucursal) {
            const su:SucursalI = await this.sucursalServiece.listarSucursalId(s);
            if (su.nombre == 'OPTICENTRO PARAGUAY') {
              sucursales.push(su);
            } else {
              sucursales.push(su);
            }
          }
        }   
        return sucursales;
      }



      async filtroParaTodasEmpresas (ventaTodasDto:VentaTodasDto):Promise<SucursalI[]>{ /// devuelve todas las scursales cuando se le aplica todas
        let sucursales:SucursalI[]=[]
        
        if(ventaTodasDto.empresa.length > 0 && ventaTodasDto.sucursal.length == 0){
          
          for (const empresa of ventaTodasDto.empresa) {
           const sucursal = await this.sucursalService.sucursalListaEmpresas(new Types.ObjectId(empresa))
           sucursales.push(...sucursal.filter((item)=> item.nombre !==  sucursalesEnum.opticentroParaguay))
          }
     }else {
         for (const sucursal of ventaTodasDto.sucursal) {
           const sucur = await this.sucursalService.listarSucursalId(sucursal);
           sucursales.push(sucur)
         }
     }
     return sucursales

    }


      
      

}