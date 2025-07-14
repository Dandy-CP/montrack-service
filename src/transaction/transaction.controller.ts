import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { TransactionService } from './transaction.service';
import { GetUser } from '../auth/decorators/user.decorator';
import { CreateTransactionBodyDTO } from './dto/transaction.dto';
import { JWTPayloadUser } from '../auth/interface/authResponse.interface';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/list')
  GetListTransaction(
    @GetUser() user: JWTPayloadUser,
    @Query('transaction_from') transactionFrom: string,
  ) {
    return this.transactionService.GetTransactionList(
      user.user_id,
      transactionFrom,
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
