import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionBodyDTO } from './dto/transaction.dto';
import { WalletService } from '../wallet/wallet.service';
import { PocketService } from '../pocket/pocket.service';
import { UploadService } from '../upload/upload.service';
import { GoalsService } from '../goals/goals.service';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private pocketService: PocketService,
    private goalsService: GoalsService,
    private uploadService: UploadService,
  ) {}

  async GetTransactionList(
    userId: string,
    transactionFrom: string,
    queryPage: QueryPagination,
  ) {
    const [data, meta] = await this.prisma
      .extends()
      .recentTransaction.paginate({
        where: {
          transaction_from: transactionFrom,
          wallet_owner: {
            wallet_owner_id: userId,
          },
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

  async CreateTransaction(payload: CreateTransactionBodyDTO, userId: string) {
    const {
      attachment_file,
      transaction_ammount,
      pocketId,
      goalsId,
      ...restPayload
    } = payload;
    let uploadedUrl: string = '';

    // Upload attachment if provided
    if (attachment_file) {
      const uploadedAttachment = await this.uploadService.UploadFiles(
        { file: attachment_file },
        userId,
      );

      uploadedUrl = uploadedAttachment.fullPath;
    }

    // Get active wallet
    const activeWallet = await this.walletService.GetActiveWallet(userId);

    // Prepare balance update payload
    const updatedBalancePayload = {
      amount: transaction_ammount,
      transaction_type: payload.transaction_type,
    };

    // Update wallet balance
    await this.walletService.updateWalletBalance(updatedBalancePayload, userId);

    // Update pocket balance if transaction is from POCKET
    if (payload.transaction_from === 'POCKET' && pocketId) {
      await this.pocketService.UpdatePocketBalance(
        updatedBalancePayload,
        pocketId,
      );
    }

    // Update goals balance if transaction is from GOALS
    if (payload.transaction_from === 'GOALS' && goalsId) {
      await this.goalsService.UpdateGoalsBalance(
        updatedBalancePayload,
        goalsId,
      );
    }

    // Excute create transaction
    return this.prisma.recentTransaction.create({
      data: {
        ...restPayload,
        transaction_ammount: transaction_ammount,
        transaction_attachment: uploadedUrl ?? '',

        wallet_owner: {
          connect: { wallet_id: activeWallet.wallet_id },
        },

        ...(payload.transaction_from === 'POCKET' && {
          pocket_history: {
            connect: { pocket_id: pocketId },
          },
        }),

        ...(payload.transaction_from === 'GOALS' && {
          goals_history: {
            connect: { goals_id: goalsId },
          },
        }),
      },
    });
  }
}
