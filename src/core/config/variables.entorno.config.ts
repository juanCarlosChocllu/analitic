import { ConfigModule , ConfigService} from "@nestjs/config";


ConfigModule.forRoot(
{
    isGlobal:true
}
)

const configService= new  ConfigService()
export const databaseConeccion:string=configService.get<string>('DATABASE_CONECTION')
export const port:string=configService.get<string>('PORT')

export const interfaceRed:string=configService.get<string>('INTERFACE')


export const tokenDescargas:string=configService.get<string>('TOKEN_DESCARGAS')

export const apiMia:string=configService.get<string>('API_MIA')


export const api_key:string=configService.get<string>('API_KEY')
export const frontend1:string=configService.get<string>('RUTA_FRONTEND1')
export const frontend2:string=configService.get<string>('RUTA_FRONTEND2')
console.log(frontend1);
