import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PocketService } from './pocket.service';
import { GetUser } from '../auth/decorators/user.decorator';
import { JWTPayloadUser } from '../auth/interface/authResponse.interface';
import {
  CreatePocketDTO,
  UpdatePocketBalanceDTO,
  UpdatePocketDTO,
} from './dto/pocket.dto';

@Controller('pocket')
export class PocketController {
  constructor(private readonly pocketService: PocketService) {}

  @Get('/list')
  GetPocketList(@GetUser() user: JWTPayloadUser) {
    return this.pocketService.GetPocketList(user.user_id);
  }

  @Get('/detail')
  GetPocketDetail(
    @GetUser() user: JWTPayloadUser,
    @Query('pocket_id') pocketId: string,
  ) {
    return this.pocketService.GetPocketDetails(user.user_id, pocketId);
  }

  @Get('/balance')
  GetBalance(@GetUser() user: JWTPayloadUser) {
    return this.pocketService.GetWalletBallance(user.user_id);
  }

  @Post('/create')
  CreatePocket(
    @Body() payload: CreatePocketDTO,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.pocketService.CreatePocket(payload, user.user_id);
  }

  @Put('/update')
  UpdatePocket(
    @Body() payload: UpdatePocketDTO,
    @Query('pocket_id') pocketId: string,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.pocketService.UpdatePocket(payload, pocketId, user.user_id);
  }

  @Put('/update-balance')
  UpdatePocketBalance(
    @Body() payload: UpdatePocketBalanceDTO,
    @Query('pocket_id') pocketId: string,
  ) {
    return this.pocketService.UpdatePocketBalance(payload, pocketId);
  }

  @Delete('/delete')
  DeletePocket(@Query('pocket_id') pocketId: string) {
    return this.pocketService.DeletePocket(pocketId);
  }
}
