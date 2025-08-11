import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { GoalsService } from './goals.service';
import { GetUser } from '../auth/decorators/user.decorator';
import { JWTPayloadUser } from '../auth/interface/authResponse.interface';
import {
  CreateGoalsDTO,
  UpdateGoalsBalanceDTO,
  UpdateGoalsDTO,
} from './dto/goals.dto';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get('/list')
  GetListGoals(
    @GetUser() user: JWTPayloadUser,
    @Query() query: QueryPagination,
  ) {
    return this.goalsService.GetGoalsList(user.user_id, query);
  }

  @Get('/detail')
  GetGoalDetail(@Query('goals_id') goalsId: string) {
    return this.goalsService.getGoalsDetail(goalsId);
  }

  @Post('/create')
  @FormDataRequest()
  CreateGoals(
    @Body() payload: CreateGoalsDTO,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.goalsService.CreateGoals(payload, user.user_id);
  }

  @Put('/update')
  @FormDataRequest()
  UpdateGoals(
    @Body() payload: UpdateGoalsDTO,
    @Query('goals_id') goalsId: string,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.goalsService.UpdateGoals(payload, goalsId, user.user_id);
  }

  @Put('/update-balance')
  UpdateGoalsBalance(
    @Body() payload: UpdateGoalsBalanceDTO,
    @Query('goals_id') goalsId: string,
  ) {
    return this.goalsService.UpdateGoalsBalance(payload, goalsId);
  }

  @Delete('/delete')
  DeleteGoals(@Query('goals_id') goalsId: string) {
    return this.goalsService.DeleteGoals(goalsId);
  }
}
