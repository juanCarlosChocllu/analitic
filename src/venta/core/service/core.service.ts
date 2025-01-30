import { Injectable } from "@nestjs/common";
import { SucursalService } from "src/sucursal/sucursal.service";

import { Types } from "mongoose";
import { SucursalI } from "src/core/interfaces/sucursalInterface";

@Injectable()
export class CoreService{
    
    constructor (   private readonly sucursalServiece: SucursalService,){}

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

      

}