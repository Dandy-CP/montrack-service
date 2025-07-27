import { IsOptional } from 'class-validator';

export class QueryFilter {
  @IsOptional()
  startDate: string;

  @IsOptional()
  endDate: string;

  @IsOptional()
  transactionType: string;

  @IsOptional()
  transactionFrom: string;
}
