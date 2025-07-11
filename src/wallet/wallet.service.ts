import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateWalletBodyDTO,
  UpdateStatusWalletDTO,
  UpdateWalletBodyDTO,
} from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async GetWalletList(userId: string) {
    const walletInDB = await this.prisma.wallet.findMany({
      where: { wallet_owner_id: userId },
    });

    if (!walletInDB) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      message: 'Success',
      data: walletInDB,
    };
  }

  async GetActiveWallet(userId: string) {
    const walletInDB = await this.prisma.wallet.findMany({
      where: { wallet_owner_id: userId },
    });

    if (!walletInDB) {
      throw new NotFoundException('Wallet not found');
    }

    const activeWallet = walletInDB.filter(
      (value) => value.is_wallet_active === true,
    )[0];

    return {
      message: 'Success',
      data: activeWallet,
    };
  }

  async CreateWallet(payload: CreateWalletBodyDTO, userId: string) {
    const { wallet_name, wallet_amount } = payload;

    const valueCreated = await this.prisma.wallet.create({
      data: {
        wallet_name: wallet_name,
        wallet_amount: wallet_amount,
        wallet_owner: {
          connect: {
            user_id: userId,
          },
        },
      },
    });

    return {
      message: 'Success create new wallet',
      data: valueCreated,
    };
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

    const valueUpdated = await this.prisma.wallet.update({
      where: {
        wallet_id: walletID,
      },
      data: {
        wallet_name: wallet_name,
        wallet_amount: wallet_amount,
      },
    });

    return {
      message: 'Success update wallet',
      data: valueUpdated,
    };
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

    return {
      message: 'Success delete wallet',
    };
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

    return {
      message: 'Success update status wallet',
      data: updatedValue,
    };
  }
}
