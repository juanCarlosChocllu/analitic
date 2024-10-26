import { IsString, MaxLength, MinLength } from "class-validator"

export class AutenticacionDto {
    @IsString()
 
    username:string

    @IsString()
  
    password:string
}
