import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { TransactionService } from './transaction.service';
import { GetUser } from '../auth/decorators/user.decorator';
import { JWTPayloadUser } from '../auth/interface/authResponse.interface';
import { CreateTransactionBodyDTO } from './dto/transaction.dto';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';
import { QueryFilter } from '../prisma/dto/query-filter.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/list')
  GetListTransaction(
    @GetUser() user: JWTPayloadUser,
    @Query() query: QueryPagination,
    @Query() queryFilter: QueryFilter,
  ) {
    return this.transactionService.GetTransactionList(
      user.user_id,
      query,
      queryFilter,
    );
  }

  @Get('/summary')
  GetTransactionSummary(
    @GetUser() user: JWTPayloadUser,
    @Query() queryFilter: QueryFilter,
  ) {
    return this.transactionService.transactionSummary(
      user.user_id,
      queryFilter,
    );
  }

  @Post('/create')
  @FormDataRequest()
  CreateTransaction(
    @Body() payload: CreateTransactionBodyDTO,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.transactionService.CreateTransaction(payload, user.user_id);
  }
}
