import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { TransactionService } from './transaction.service';
import { GetUser } from '../auth/decorators/user.decorator';
import { JWTPayloadUser } from '../auth/interface/authResponse.interface';
import { CreateTransactionBodyDTO } from './dto/transaction.dto';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/list')
  GetListTransaction(
    @GetUser() user: JWTPayloadUser,
    @Query('transaction_from') transactionFrom: string,
    @Query() query: QueryPagination,
  ) {
    return this.transactionService.GetTransactionList(
      user.user_id,
      transactionFrom,
      query,
    );
  }

  @Get('/summary')
  GetTransactionSummary(@GetUser() user: JWTPayloadUser) {
    return this.transactionService.transactionSummary(user.user_id);
  }

  @Get('/income')
  GetIncomeList(
    @GetUser() user: JWTPayloadUser,
    @Query() query: QueryPagination,
  ) {
    return this.transactionService.getIncome(user.user_id, query);
  }

  @Get('/expense')
  GetExpenseList(
    @GetUser() user: JWTPayloadUser,
    @Query() query: QueryPagination,
  ) {
    return this.transactionService.getExpense(user.user_id, query);
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
