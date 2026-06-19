import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ApiTag } from './openapi/api-tags';

@ApiTags(ApiTag.Health)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Liveness check.
   * @remarks Returns a static greeting; use it to confirm the service is up.
   */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
