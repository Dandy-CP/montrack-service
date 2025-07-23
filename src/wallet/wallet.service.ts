import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWalletBodyDTO,
  UpdateBalanceWalletDTO,
  UpdateStatusWalletDTO,
  UpdateWalletBodyDTO,
} from './dto/wallet.dto';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async GetWalletList(userId: string, queryPage: QueryPagination) {
    const [data, meta] = await this.prisma
      .extends()
      .wallet.paginate({
        where: { wallet_owner_id: userId },
        include: {
          user_pocket: true,
          user_goals: true,
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

  async GetActiveWallet(userId: string) {
    const walletInDB = await this.prisma.wallet.findMany({
      where: { wallet_owner_id: userId, is_wallet_active: true },
      include: {
        user_goals: true,
        user_pocket: true,
        recent_transaction: true,
        wallet_owner: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return walletInDB.filter((value) => value.is_wallet_active === true)[0];
  }

  async CreateWallet(
    payload: CreateWalletBodyDTO,
    userId: string,
    activeDefault: boolean = false,
  ) {
    const { wallet_name, wallet_amount } = payload;

    return await this.prisma.wallet.create({
      data: {
        wallet_name: wallet_name,
        wallet_amount: wallet_amount,
        is_wallet_active: activeDefault,
        wallet_owner: {
          connect: {
            user_id: userId,
          },
        },
      },
    });
  }

  async UpdateWallet(payload: UpdateWalletBodyDTO, walletID: string) {
    const { wallet_name, wallet_amount } = payload;

    const walletInDB = await this.prisma.wallet.findUnique({
      where: {
        wallet_id: walletID,
      },
    });

    if (!walletInDB) {
      throw new NotFoundException('Wallet not found');
    }

    return await this.prisma.wallet.update({
      where: {
        wallet_id: walletID,
      },
      data: {
        wallet_name: wallet_name,
        wallet_amount: wallet_amount,
      },
    });
  }

  async updateWalletBalance(payload: UpdateBalanceWalletDTO, userId: string) {
    const { amount, transaction_type } = payload;

    const activeWallet = await this.GetActiveWallet(userId);

    if (!activeWallet) {
      throw new NotFoundException('Wallet not found');
    }

    let finalAmount = activeWallet.wallet_amount;

    if (transaction_type === 'INCOME') {
      finalAmount = finalAmount + amount;
    }

    if (transaction_type === 'EXPENSE') {
      if (activeWallet.wallet_amount <= amount) {
        throw new UnprocessableEntityException('Wallet ammount is not enough');
      }

      finalAmount = finalAmount - amount;
    }

    return await this.prisma.wallet.update({
      where: {
        wallet_id: activeWallet.wallet_id,
      },
      data: {
        wallet_amount: finalAmount,
      },
    });
  }

  async DeleteWallet(walletID: string) {
    const walletInDB = await this.prisma.wallet.findUnique({
      where: {
        wallet_id: walletID,
      },
    });

    if (!walletInDB) {
      throw new NotFoundException('Wallet not found');
    }

    if (walletInDB.is_wallet_active) {
      throw new UnprocessableEntityException('Wallet is active');
    }

    await this.prisma.wallet.delete({
      where: {
        wallet_id: walletID,
      },
    });
  }

  async UpdateStatusWallet(
    payload: UpdateStatusWalletDTO,
    walletID: string,
    userID: string,
  ) {
    const walletInDB = await this.prisma.wallet.findUnique({
      where: {
        wallet_id: walletID,
      },
    });

    if (!walletInDB) {
      throw new NotFoundException('Wallet not found');
    }

    if (walletInDB.is_wallet_active && payload.is_wallet_active) {
      throw new UnprocessableEntityException('Wallet has been active');
    }

    if (!walletInDB.is_wallet_active && !payload.is_wallet_active) {
      throw new UnprocessableEntityException('Wallet has been deactive');
    }

    // Check active wallet where not in inputed wallet id
    const hasActiveWallet = await this.prisma.wallet.findMany({
      where: {
        wallet_owner_id: userID,
        is_wallet_active: true,
        NOT: {
          wallet_id: walletID,
        },
      },
    });

    if (hasActiveWallet.length === 0) {
      throw new UnprocessableEntityException('Wallet must be one active');
    }

    // Update inputed wallet status
    const updatedValue = await this.prisma.wallet.update({
      where: {
        wallet_id: walletID,
      },
      data: {
        is_wallet_active: payload.is_wallet_active,
      },
    });

    // Update all wallet where not in inputed wallet id
    await this.prisma.wallet.updateMany({
      where: {
        NOT: {
          wallet_id: walletID,
        },
      },
      data: {
        is_wallet_active: false,
      },
    });

    return updatedValue;
  }
}
