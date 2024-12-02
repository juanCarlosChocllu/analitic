import { Injectable } from "@nestjs/common";
import { VentaExcelDto } from "../dto/venta.dto";
import { filtradorKpi } from "../util/filtrador.kpi.util";
import { InjectModel } from "@nestjs/mongoose";
import { NombreBdConexion } from "src/enums/nombre.db.enum";
import { VentaExcel } from "../schemas/venta.schema";
import { Model, Types } from "mongoose";
import { productos } from "../enums/productos.enum";
import { flag } from "../enums/flag.enum";
import { SucursalService } from "src/sucursal/sucursal.service";
import { especialidad } from "../enums/especialidad.enum";

@Injectable()
export class VentaMedicosService {
    constructor( @InjectModel(VentaExcel.name, NombreBdConexion.oc)
    private readonly VentaExcelSchema: Model<VentaExcel>,
    private readonly sucursalServiece: SucursalService,

){}
    
    public async  kpiOtalmologos(ventaExcelDto:VentaExcelDto){
        const filtrador = filtradorKpi(ventaExcelDto)
        const data:any[]=[] 
        for(let sucursal of ventaExcelDto.sucursal){
            const su = await this.sucursalServiece.listarSucursalId(sucursal)
            const dataOptometra = await this.VentaExcelSchema.aggregate([
                {
                    $match:{
                        sucursal:new Types.ObjectId(sucursal),
                    
                        producto:productos.lente,

                        ...filtrador
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
                    {
                        $match:{
                            'oftalmologo.especialidad':especialidad.OFTALMOLOGO
                        }
                    },
                {
                    $group:{
                        _id:'$oftalmologo.nombreCompleto',
                        cantidad:{$sum:1},
                         idOptalmologo:{$first:'$oftalmologo._id'}
                    }
                },
                {
                    $project:{
                        _id:0,
                        nombre:'$_id',
                        cantidad:1,
                        idOptalmologo:1
                       
                    }
                }
            ])
            const resultado = {
                sucursal: su.nombre,
                totalRecetas:dataOptometra.reduce((acc, item)=>acc + item.cantidad, 0),
                idScursal:su.id,
                data:dataOptometra
            }
            data.push(resultado)
        }        
        return data
        


    }
    public async kpiOptometras(ventaExcelDto:VentaExcelDto){        
        const filtrador = filtradorKpi(ventaExcelDto)
        const data:any[]=[] 
        for(let sucursal of ventaExcelDto.sucursal){
            const su = await this.sucursalServiece.listarSucursalId(sucursal)
            const dataOptometra = await this.VentaExcelSchema.aggregate([
                {
                    $match:{
                        sucursal:new Types.ObjectId(sucursal),
                    
                        producto:productos.lente,

                        ...filtrador
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
                    {
                        $match:{
                            'oftalmologo.especialidad':especialidad.OPTOMETRA
                        }
                    },
                {
                    $group:{
                        _id:'$oftalmologo.nombreCompleto',
                        cantidad:{$sum:1},
                         idOptalmologo:{$first:'$oftalmologo._id'}
                    }
                },
                {
                    $project:{
                        _id:0,
                        nombre:'$_id',
                        cantidad:1,
                        idOptalmologo:1
                       
                    }
                }
            ])
            const resultado = {
                sucursal: su.nombre,
                totalRecetas:dataOptometra.reduce((acc, item)=>acc + item.cantidad, 0),
                idScursal:su.id,
                data:dataOptometra
            }
            data.push(resultado)
        }        
        return data
        
    }


}
