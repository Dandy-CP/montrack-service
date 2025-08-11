import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RedisService } from '../redis/redis.service';
import {
  CreatePocketDTO,
  UpdatePocketBalanceDTO,
  UpdatePocketDTO,
} from './dto/pocket.dto';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';

@Injectable()
export class PocketService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private redisService: RedisService,
  ) {}

  async GetPocketList(userId: string, queryPage: QueryPagination) {
    const activeWallet = await this.walletService.GetActiveWallet(userId);

    const [data, meta] = await this.prisma
      .extends()
      .pocket.paginate({
        where: {
          wallet_owner_id: activeWallet.wallet_id,
        },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          pocket_history: true,
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

  async GetPocketDetails(userId: string, pocketId: string) {
    const activeWallet = await this.walletService.GetActiveWallet(userId);

    const PocketInDB = await this.prisma.pocket.findUnique({
      where: {
        wallet_owner_id: activeWallet.wallet_id,
        pocket_id: pocketId,
      },
      include: {
        pocket_history: true,
      },
    });

    if (!PocketInDB) {
      throw new NotFoundException('Pocket not found');
    }

    return PocketInDB;
  }

  async CreatePocket(payload: CreatePocketDTO, userId: string) {
    const { pocket_name, pocket_emoji, pocket_amount, pocket_description } =
      payload;

    const activeWallet = await this.walletService.GetActiveWallet(userId);

    const allPocketAmount = activeWallet.user_pocket
      .map((value) => value.pocket_ammount)
      .sort((a, b) => b - a);

    const allPocketBalance = allPocketAmount.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue;
      },
      0,
    );

    const availableWalletBalance =
      activeWallet.wallet_amount - allPocketBalance;

    if (pocket_amount <= availableWalletBalance) {
      await this.redisService.deleteAllRelatedKeys('wallet');

      return await this.prisma.pocket.create({
        data: {
          pocket_name: pocket_name,
          pocket_emoji: pocket_emoji,
          pocket_ammount: pocket_amount,
          pocket_set_amount: pocket_amount,
          pocket_description: pocket_description,
          wallet_owner: {
            connect: {
              wallet_id: activeWallet.wallet_id,
            },
          },
        },
      });
    } else {
      throw new UnprocessableEntityException('Wallet ammount is not enough');
    }
  }

  async UpdatePocket(
    payload: UpdatePocketDTO,
    pocketID: string,
    userId: string,
  ) {
    const { pocket_name, pocket_emoji, pocket_amount, pocket_description } =
      payload;

    const pocketInDB = await this.prisma.pocket.findUnique({
      where: {
        pocket_id: pocketID,
      },
    });

    if (!pocketInDB) {
      throw new NotFoundException('Pocket not found');
    }

    const activeWallet = await this.walletService.GetActiveWallet(userId);

    const allPocketAmount = activeWallet.user_pocket
      .filter((value) => value.pocket_id !== pocketID)
      .map((value) => value.pocket_ammount)
      .sort((a, b) => b - a);

    const allPocketBalance = allPocketAmount.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue;
      },
      0,
    );

    const availableWalletBalance =
      activeWallet.wallet_amount - allPocketBalance;

    if (pocket_amount <= availableWalletBalance) {
      return await this.prisma.pocket.update({
        where: {
          pocket_id: pocketID,
        },
        data: {
          pocket_name: pocket_name,
          pocket_emoji: pocket_emoji,
          pocket_ammount: pocket_amount,
          pocket_set_amount: pocket_amount,
          pocket_description: pocket_description,
        },
      });
    } else {
      throw new UnprocessableEntityException('Wallet ammount is not enough');
    }
  }

  async UpdatePocketBalance(payload: UpdatePocketBalanceDTO, pocketId: string) {
    const { amount, transaction_type } = payload;

    const pocketInDB = await this.prisma.pocket.findUnique({
      where: {
        pocket_id: pocketId,
      },
    });

    if (!pocketInDB) {
      throw new NotFoundException('Pocket not found');
    }

    let finalAmount = pocketInDB.pocket_ammount;

    if (transaction_type === 'INCOME') {
      finalAmount = finalAmount + amount;
    }

    if (transaction_type === 'EXPENSE') {
      if (pocketInDB.pocket_ammount <= amount) {
        throw new UnprocessableEntityException('Pocket ammount is not enough');
      }

      finalAmount = finalAmount - amount;
    }

    return await this.prisma.pocket.update({
      where: {
        pocket_id: pocketId,
      },
      data: {
        pocket_ammount: finalAmount,
      },
    });
  }

  async DeletePocket(pcoketId: string) {
    const pocketInDB = await this.prisma.pocket.findUnique({
      where: {
        pocket_id: pcoketId,
      },
    });

    if (!pocketInDB) {
      throw new NotFoundException('Pocket not found');
    }

    await this.redisService.deleteAllRelatedKeys('wallet');

    await this.prisma.pocket.delete({
      where: {
        pocket_id: pcoketId,
      },
    });
  }
}
