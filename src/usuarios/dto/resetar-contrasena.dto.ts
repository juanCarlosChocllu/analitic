import { IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class ResetearContrasena{
    
    @IsString({ message: 'Contraseña requerida.' })
    @MinLength(8, { message: 'Mínimo 8 caracteres.' })
    @MaxLength(20, { message: 'Máximo 20 caracteres.' })
    @IsStrongPassword({}, { 
        message: 'Incluir mayúsculas, minúsculas, números y símbolos.' 
    })
    password: string;
    
}