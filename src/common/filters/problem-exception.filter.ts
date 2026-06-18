import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, unknown>;
}

/** Renders all unhandled exceptions as RFC 7807 `application/problem+json`. */
@Catch()
export class ProblemExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let detail = 'Internal server error';
    let errors: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        detail = response;
      } else {
        const body = response as {
          message?: string | string[];
          error?: string;
        };
        if (Array.isArray(body.message)) {
          errors = { messages: body.message };
          detail = body.error ?? STATUS_CODES[status] ?? 'Error';
        } else {
          detail =
            body.message ?? body.error ?? STATUS_CODES[status] ?? 'Error';
        }
      }
    } else {
      // Don't leak internals; log the real error for ops.
      this.logger.error(exception);
    }

    const problem: ProblemDetails = {
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail,
      instance: req.url,
      ...(errors ? { errors } : {}),
    };

    res.status(status);
    res.setHeader('Content-Type', 'application/problem+json');
    res.json(problem);
  }
}
