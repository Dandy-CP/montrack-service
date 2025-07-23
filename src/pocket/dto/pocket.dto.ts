import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePocketDTO {
  @IsNotEmpty()
  pocket_name: string;

  @IsNotEmpty()
  pocket_emoji: string;

  @IsNotEmpty()
  @IsNumber()
  pocket_amount: number;

  @IsOptional()
  pocket_description: string;
}

export class UpdatePocketDTO {
  @IsNotEmpty()
  pocket_name: string;

  @IsNotEmpty()
  pocket_emoji: string;

  @IsNotEmpty()
  @IsNumber()
  pocket_amount: number;

  @IsOptional()
  pocket_description: string;
}

export class UpdatePocketBalanceDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  transaction_type: string;
}
