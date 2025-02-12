import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsNumber } from "class-validator"
import { Types } from "mongoose"

export class CreateMetasSucursalDto {
    @IsNumber({},{ message: 'El monto debe ser un número válido' })
    @IsNotEmpty({ message: 'El monto es obligatorio' })
    monto: number;
  
    @IsNumber({},{ message: 'El ticket debe ser un número válido' })
    @IsNotEmpty({ message: 'El ticket es obligatorio' })
    ticket: number;
  
    @IsMongoId({ message: 'El id de sucursal debe ser un ObjectId válido',  each:true})
    @IsNotEmpty({ message: 'El id de la sucursal es obligatorio' , each:true}, )
    @IsArray()
    sucursal: Types.ObjectId []=[];

    @IsNumber({},{ message: 'El dia debe ser un número válido' })
    @IsNotEmpty({ message: 'El dia es obligatorio' })
    dias: number;
  
    @IsDateString({},{ message: 'La fecha de inicio debe ser una cadena de fecha válida (ISO 8601)' })
    @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
    fechaInicio: string;
  
    @IsDateString({},{ message: 'La fecha de fin debe ser una cadena de fecha válida (ISO 8601)' })
    @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
    fechaFin: string;
  }