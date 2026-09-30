import { Controller, Get } from '@nestjs/common';
import * as os from 'os';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      hostname: os.hostname(),
    };
  }
}
