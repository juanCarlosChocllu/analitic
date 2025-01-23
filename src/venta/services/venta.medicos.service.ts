import { Injectable } from "@nestjs/common";
import { VentaExcelDto } from "../dto/venta.dto";
import { filtradorKpi } from "../util/filtrador.kpi.util";
import { InjectModel } from "@nestjs/mongoose";
import { NombreBdConexion } from "src/enums/nombre.db.enum";
import { VentaExcel } from "../schemas/venta.schema";
import { Model, Types } from "mongoose";
import { SucursalService } from "src/sucursal/sucursal.service";

import { VentaMedicosDto } from "../dto/venta.medicos.dto";
import { OftalmologoService } from "src/oftalmologo/oftalmologo.service";
import { filtradorMedicos } from "../util/filtro.medicos.util";
import { especialidad } from "../enums/especialidad.enum";


@Injectable()
export class VentaMedicosService {
    constructor( @InjectModel(VentaExcel.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<VentaExcel>,
    private readonly sucursalServiece: SucursalService,
    private readonly oftalmologoService:OftalmologoService

){}
    

    public async kpiMedicos(ventaMedicosDto:VentaMedicosDto){            
       const {especialidad, ...nuevoFiltro} = filtradorMedicos(ventaMedicosDto)
        const data:any[]=[] 
        for(let sucursal of ventaMedicosDto.sucursal){
            const su = await this.sucursalServiece.listarSucursalId(sucursal)
            const dataMedicos = await this.VentaExcelSchema.aggregate([
                {
                    $match:{
                        sucursal:new Types.ObjectId(sucursal),
                        ...nuevoFiltro
                    }
                },

                {
                    $lookup:{
                        from:'Oftalmologo',
                        foreignField:'_id',
                        localField:'oftalmologo',
                        as:'oftalmologo'
                    }
                },
                {
                    $unwind:{path:'$oftalmologo', preserveNullAndEmptyArrays:false}
                },
                ...(especialidad) ? [
                    {
                        $match:{
                            'oftalmologo.especialidad':especialidad 
                        }
                    }
                ] : [],
              
                {
                    $group:{
                        _id:'$oftalmologo.nombreCompleto',
                        cantidad:{$sum:{
                            $cond:{
                                if:{$eq:['$producto','LENTE']},
                                then:'$cantidad',
                                else:0
                            
                            }
                         }},


                         medico:{$first:'$oftalmologo._id'},


                         tickets:{$sum:{
                            $cond:{
                                if:{$eq:['$aperturaTicket','1']},
                                then:'$cantidad',
                                else:0
                            
                            }
                         }},


                         importe:{$sum:{
                            $cond:{
                                if:{$eq:['$aperturaTicket','1']},
                                then:'$importe',
                                else:0
                            
                            }
                         }}
                    }
                },
                {
                    $project:{
                        _id:0,
                        nombre:'$_id',
                        cantidad:1,
                        medico:1,
                        tickets:1,
                        importe:1,
                        e:'$oftalmologo.especialidad'
                       
                    }
                }
            ])
            
            const resultado = {
                sucursal: su.nombre,
                totalRecetas:dataMedicos.reduce((acc, item)=>acc + item.cantidad, 0),
                tickets:dataMedicos.reduce((acc, item)=>acc + item.tickets, 0),
                importe:dataMedicos.reduce((acc, item)=>acc + item.importe, 0),
                idScursal:su.id,
                data:dataMedicos
            }
            data.push(resultado)                
        }  
        return data
        
    }


}
