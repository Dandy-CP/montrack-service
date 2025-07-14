import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWalletBodyDTO {
  @IsNotEmpty()
  wallet_name: string;

  @IsNotEmpty()
  wallet_amount: number;
}

export class UpdateWalletBodyDTO {
  @IsNotEmpty()
  wallet_name: string;

  @IsNotEmpty()
  wallet_amount: number;
}

export class UpdateBalanceWalletDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  transaction_type: string;
}

export class UpdateStatusWalletDTO {
  @IsNotEmpty()
  @IsBoolean()
  is_wallet_active: boolean;
}
