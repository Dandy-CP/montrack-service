import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionBodyDTO } from './dto/transaction.dto';
import { WalletService } from '../wallet/wallet.service';
import { PocketService } from '../pocket/pocket.service';
import { UploadService } from '../upload/upload.service';
import { GoalsService } from '../goals/goals.service';
import { QueryPagination } from '../prisma/dto/query-pagination.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private pocketService: PocketService,
    private goalsService: GoalsService,
    private uploadService: UploadService,
    private RedisService: RedisService,
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

    // Validate required IDs based on transaction_from
    if (payload.transaction_from === 'POCKET' && !pocketId) {
      throw new UnprocessableEntityException(
        'Transaction from pocket need pocketId',
      );
    }

    if (payload.transaction_from === 'GOALS' && !goalsId) {
      throw new UnprocessableEntityException(
        'Transaction from goals need goalsId',
      );
    }

    // Upload attachment if provided
    let uploadedUrl: string = '';
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

    // Update wallet balance and Clear all value cache related to wallet
    await this.walletService.updateWalletBalance(updatedBalancePayload, userId);
    await this.RedisService.deleteAllRelatedKeys(userId, 'wallet');

    // Update pocket or goals balance and clear cache
    if (payload.transaction_from === 'POCKET' && pocketId) {
      await this.pocketService.UpdatePocketBalance(
        updatedBalancePayload,
        pocketId,
      );
      await this.RedisService.deleteAllRelatedKeys(userId, 'pocket');
    } else if (payload.transaction_from === 'GOALS' && goalsId) {
      await this.goalsService.UpdateGoalsBalance(
        updatedBalancePayload,
        goalsId,
      );
      await this.RedisService.deleteAllRelatedKeys(userId, 'goals');
    }

    // Prepare relation connections
    const relationData: any = {};
    if (payload.transaction_from === 'POCKET' && pocketId) {
      relationData.pocket_history = { connect: { pocket_id: pocketId } };
    }

    if (payload.transaction_from === 'GOALS' && goalsId) {
      relationData.goals_history = { connect: { goals_id: goalsId } };
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
        ...relationData,
      },
    });
  }

  async getIncome(userId: string, queryPage: QueryPagination) {
    const activeWallet = await this.walletService.GetActiveWallet(userId);

    const [data, meta] = await this.prisma
      .extends()
      .recentTransaction.paginate({
        where: {
          transaction_type: 'INCOME',
          wallet_owner: {
            wallet_id: activeWallet.wallet_id,
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

  async getExpense(userId: string, queryPage: QueryPagination) {
    const activeWallet = await this.walletService.GetActiveWallet(userId);

    const [data, meta] = await this.prisma
      .extends()
      .recentTransaction.paginate({
        where: {
          transaction_type: 'EXPENSE',
          wallet_owner: {
            wallet_id: activeWallet.wallet_id,
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

  async transactionSummary(userId: string) {
    const activeWallet = await this.walletService.GetActiveWallet(userId);

    // Fetch income and expense transactions in parallel
    const [trxIncomeInDB, trxExpenseInDB] = await Promise.all([
      this.prisma.recentTransaction.findMany({
        where: {
          transaction_type: 'INCOME',
          wallet_owner: { wallet_id: activeWallet.wallet_id },
        },
      }),
      this.prisma.recentTransaction.findMany({
        where: {
          transaction_type: 'EXPENSE',
          wallet_owner: { wallet_id: activeWallet.wallet_id },
        },
      }),
    ]);

    // Sum income and expense amounts
    const income = trxIncomeInDB.reduce(
      (sum, trx) => sum + trx.transaction_ammount,
      0,
    );
    const expense = trxExpenseInDB.reduce(
      (sum, trx) => sum + trx.transaction_ammount,
      0,
    );

    return { income, expense };
  }
}
