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

