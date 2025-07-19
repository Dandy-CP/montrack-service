import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { toNumeric } from '../../utils/toNumeric';

export class QueryPagination {
  @IsOptional()
  @Transform(toNumeric)
  page: number = 1;

  @IsOptional()
  @Transform(toNumeric)
  limit: number = 10;
}
