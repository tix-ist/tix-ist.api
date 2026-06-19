import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiTag } from './openapi/api-tags';

@ApiTags(ApiTag.Health)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Liveness check.
   * @remarks Returns a static greeting; use it to confirm the service is up. Served at the
   * unversioned root (`/`) and exempt from rate limiting so health probes aren't throttled.
   */
  @Public()
  @SkipThrottle()
  @Version(VERSION_NEUTRAL)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
