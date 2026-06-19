import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ProblemExceptionFilter } from './filters/problem-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

/**
 * Wires global cross-cutting providers: the standard response envelope interceptor,
 * the RFC 7807 error filter, and the rate-limit guard.
 */
@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: ProblemExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class CommonModule {}
