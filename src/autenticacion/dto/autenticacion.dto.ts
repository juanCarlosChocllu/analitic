import { IsNotEmpty, IsString } from 'class-validator';

export class AutenticacionDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
