import { Injectable } from '@nestjs/common';
import { CreateAsesoreDto } from './dto/create-asesore.dto';
import { UpdateAsesoreDto } from './dto/update-asesore.dto';

@Injectable()
export class AsesoresService {
  create(createAsesoreDto: CreateAsesoreDto) {
    return 'This action adds a new asesore';
  }

  findAll() {
    return `This action returns all asesores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asesore`;
  }

  update(id: number, updateAsesoreDto: UpdateAsesoreDto) {
    return `This action updates a #${id} asesore`;
  }

  remove(id: number) {
    return `This action removes a #${id} asesore`;
  }
}
