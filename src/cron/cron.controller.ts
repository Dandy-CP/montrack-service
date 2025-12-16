import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('cron')
export class CronController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  async doCronJob() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
    };
  }
}
