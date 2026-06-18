import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ProblemExceptionFilter } from './filters/problem-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

/** Wires the standard response envelope + RFC 7807 error filter globally. */
@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: ProblemExceptionFilter },
  ],
})
export class CommonModule {}
