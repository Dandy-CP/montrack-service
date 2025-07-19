import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetUser } from '../auth/decorators/user.decorator';
import {
  CreateWalletBodyDTO,
  UpdateBalanceWalletDTO,
  UpdateStatusWalletDTO,
  UpdateWalletBodyDTO,
} from './dto/wallet.dto';
import { JWTPayloadUser } from '../auth/interface/authResponse.interface';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('/list')
  GetWalletList(
    @GetUser() user: JWTPayloadUser,
    @Query() query: QueryPagination,
  ) {
    return this.walletService.GetWalletList(user.user_id, query);
  }

  @Get('/active')
  GetActiveWallet(@GetUser() user: JWTPayloadUser) {
    return this.walletService.GetActiveWallet(user.user_id);
  }

  @Post('/create')
  CreateWallet(
    @Body() payload: CreateWalletBodyDTO,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.walletService.CreateWallet(payload, user.user_id);
  }

  @Put('/update')
  UpdateWallet(
    @Body() payload: UpdateWalletBodyDTO,
    @Query('wallet_id') walletId: string,
  ) {
    return this.walletService.UpdateWallet(payload, walletId);
  }

  @Put('/balance')
  UpdateBalance(
    @Body() payload: UpdateBalanceWalletDTO,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.walletService.updateWalletBalance(payload, user.user_id);
  }

  @Put('/status')
  UpdateWalletStatus(
    @Body() payload: UpdateStatusWalletDTO,
    @Query('wallet_id') walletId: string,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.walletService.UpdateStatusWallet(
      payload,
      walletId,
      user.user_id,
    );
  }

  @Delete('/delete')
  DeleteWallet(@Query('wallet_id') walletId: string) {
    return this.walletService.DeleteWallet(walletId);
  }
}
