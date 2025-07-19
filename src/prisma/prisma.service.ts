import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import pagination from 'prisma-extension-pagination';

@Injectable()
export class PrismaService extends PrismaClient {
  extends() {
    return this.$extends(pagination({ pages: { includePageCount: true } }));
  }
}
