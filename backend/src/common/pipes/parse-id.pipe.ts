import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

const MAX_ID = 2_147_483_647;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!POSITIVE_INTEGER.test(value) || id > MAX_ID) {
      throw new NotFoundException('Recurso não encontrado.');
    }
    return id;
  }
}
