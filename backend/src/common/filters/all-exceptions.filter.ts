import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  status: number;
  message: string;
}

const ROUTE_NOT_FOUND = 'Recurso não encontrado.';
const UNEXPECTED_ERROR = 'Erro inesperado no servidor. Tente novamente.';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const { status, message } = this.toErrorBody(exception, request);

    response.status(status).json({ message });
  }

  private toErrorBody(exception: unknown, request: Request): ErrorBody {
    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: UNEXPECTED_ERROR,
      };
    }

    const status = exception.getStatus();
    if (exception instanceof NotFoundException && !request.route) {
      return { status, message: ROUTE_NOT_FOUND };
    }
    return { status, message: messageOf(exception) };
  }
}

function messageOf(exception: HttpException): string {
  const body = exception.getResponse();
  if (typeof body === 'string') {
    return body;
  }
  const { message } = body as { message?: unknown };
  if (Array.isArray(message)) {
    return message.join(' ');
  }
  return typeof message === 'string' ? message : exception.message;
}
