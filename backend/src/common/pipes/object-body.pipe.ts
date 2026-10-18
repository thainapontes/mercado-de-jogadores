import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ObjectBodyPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body') {
      return value;
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new BadRequestException(
        'O corpo da requisição deve ser um objeto JSON válido.',
      );
    }
    return value;
  }
}
