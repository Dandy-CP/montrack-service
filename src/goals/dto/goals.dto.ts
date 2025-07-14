import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsFile,
  HasMimeType,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';
import { toNumeric } from '../../utils/toNumeric';

export class CreateGoalsDTO {
  @IsNotEmpty()
  goals_name: string;

  @IsOptional()
  goals_description: string;

  @IsNotEmpty()
  @Transform(toNumeric)
  goals_set_amount: number;

  @IsNotEmpty()
  @Transform(toNumeric)
  goals_amount: number;

  @IsOptional()
  @IsFile()
  @HasMimeType(['image/jpeg', 'image/png']) // Accept only file image/jpeg or png
  @MaxFileSize(5 * 1024 * 1024) // Max file size 5MB
  attachment_file: MemoryStoredFile;
}

export class UpdateGoalsDTO {
  @IsNotEmpty()
  goals_name: string;

  @IsOptional()
  goals_description: string;

  @IsNotEmpty()
  @Transform(toNumeric)
  goals_set_amount: number;

  @IsNotEmpty()
  @Transform(toNumeric)
  goals_amount: number;

  @IsOptional()
  @IsFile()
  @HasMimeType(['image/jpeg', 'image/png']) // Accept only file image/jpeg or png
  @MaxFileSize(5 * 1024 * 1024) // Max file size 5MB
  attachment_file: MemoryStoredFile;
}

export class UpdateGoalsBalanceDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  transaction_type: string;
}
