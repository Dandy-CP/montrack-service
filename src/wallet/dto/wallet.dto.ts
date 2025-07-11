import { IsBoolean, IsNotEmpty } from 'class-validator';

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

export class UpdateStatusWalletDTO {
  @IsNotEmpty()
  @IsBoolean()
  is_wallet_active: boolean;
}
