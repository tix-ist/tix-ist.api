import { describe, expect, it, jest } from '@jest/globals';
import {
  ArgumentsHost,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProblemExceptionFilter } from './problem-exception.filter';

function mockHost(url = '/x') {
  const res = {
    status: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;
  return { host, res };
}

describe('ProblemExceptionFilter', () => {
  const filter = new ProblemExceptionFilter();

  it('maps an HttpException to an RFC 7807 problem', () => {
    const { host, res } = mockHost('/auth/login');

    filter.catch(new UnauthorizedException('Invalid credentials'), host);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/problem+json',
    );
    expect(res.json.mock.calls[0][0]).toMatchObject({
      status: 401,
      title: 'Unauthorized',
      detail: 'Invalid credentials',
      instance: '/auth/login',
    });
  });

  it('captures class-validator messages into errors', () => {
    const { host, res } = mockHost();

    filter.catch(
      new BadRequestException({
        message: ['email must be an email'],
        error: 'Bad Request',
        statusCode: 400,
      }),
      host,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0] as {
      status: number;
      errors: unknown;
    };
    expect(body.status).toBe(400);
    expect(body.errors).toEqual({ messages: ['email must be an email'] });
  });

  it('maps an unknown error to a 500 problem without leaking detail', () => {
    const { host, res } = mockHost();

    filter.catch(new Error('boom secret'), host);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0] as {
      status: number;
      detail: string;
    };
    expect(body.status).toBe(500);
    expect(body.detail).not.toContain('boom secret');
  });
});
