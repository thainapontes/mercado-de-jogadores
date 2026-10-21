import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { MAX_ID } from '../ids/max-id';

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
