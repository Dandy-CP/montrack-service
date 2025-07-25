import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { UploadService } from '../upload/upload.service';
import {
  CreateGoalsDTO,
  UpdateGoalsBalanceDTO,
  UpdateGoalsDTO,
} from './dto/goals.dto';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private uploadService: UploadService,
  ) {}

  async GetGoalsList(userId: string, queryPage: QueryPagination) {
    const [data, meta] = await this.prisma
      .extends()
      .goals.paginate({
        where: {
          wallet_owner: {
            wallet_owner_id: userId,
          },
        },
        include: {
          goals_history: true,
          wallet_owner: true,
        },
      })
      .withPages({
        page: queryPage.page,
        limit: queryPage.limit,
      });

    return {
      data,
      meta,
    };
  }

  async CreateGoals(payload: CreateGoalsDTO, userId: string) {
    const { attachment_file, ...restPayload } = payload;

    const activeWallet = await this.walletService.GetActiveWallet(userId);
    let uploadedUrl: string = '';

    // Upload attachment if provided
    if (attachment_file) {
      const uploadedAttachment = await this.uploadService.UploadFiles(
        { file: attachment_file },
        userId,
      );

      uploadedUrl = uploadedAttachment.fullPath;
    }

    return await this.prisma.goals.create({
      data: {
        ...restPayload,
        goals_attachment: uploadedUrl ?? '',
        wallet_owner: {
          connect: {
            wallet_id: activeWallet.wallet_id,
          },
        },
      },
    });
  }

  async UpdateGoals(payload: UpdateGoalsDTO, goalsId: string, userId: string) {
    const { attachment_file, ...restPayload } = payload;
    let uploadedUrl: string = '';

    const goalsInDB = await this.prisma.goals.findUnique({
      where: {
        goals_id: goalsId,
      },
    });

    if (!goalsInDB) {
      throw new NotFoundException('Goals not found');
    }

    // Upload attachment if provided
    if (attachment_file) {
      const uploadedAttachment = await this.uploadService.UploadFiles(
        { file: attachment_file },
        userId,
      );

      uploadedUrl = uploadedAttachment.fullPath;
    }

    return await this.prisma.goals.update({
      where: {
        goals_id: goalsId,
      },
      data: {
        ...restPayload,
        ...(uploadedUrl.length !== 0 && {
          goals_attachment: uploadedUrl,
        }),
      },
    });
  }

  async UpdateGoalsBalance(payload: UpdateGoalsBalanceDTO, goalsId: string) {
    const goalsInDB = await this.prisma.goals.findUnique({
      where: {
        goals_id: goalsId,
      },
    });

    if (!goalsInDB) {
      throw new NotFoundException('Goals not found');
    }

    let finalAmount = goalsInDB.goals_amount;

    if (payload.transaction_type === 'INCOME') {
      finalAmount = finalAmount + payload.amount;
    }

    if (payload.transaction_type === 'EXPENSE') {
      if (goalsInDB.goals_amount <= payload.amount) {
        throw new UnprocessableEntityException('Goals ammount is not enough');
      }

      finalAmount = finalAmount - payload.amount;
    }

    return await this.prisma.goals.update({
      where: {
        goals_id: goalsId,
      },
      data: {
        goals_amount: finalAmount,
      },
    });
  }

  async DeleteGoals(goalsId: string) {
    const goalsInDB = await this.prisma.goals.findUnique({
      where: {
        goals_id: goalsId,
      },
    });

    if (!goalsInDB) {
      throw new NotFoundException('Goals not found');
    }

    await this.prisma.goals.delete({
      where: {
        goals_id: goalsId,
      },
    });
  }
}
