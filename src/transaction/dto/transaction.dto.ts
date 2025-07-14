import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsFile,
  HasMimeType,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';
import { toNumeric } from '../../utils/toNumeric';

export class CreateTransactionBodyDTO {
  @IsNotEmpty()
  transaction_name: string;

  @IsNotEmpty()
  @Transform(toNumeric)
  transaction_ammount: number;

  @IsNotEmpty()
  transaction_type: string;

  @IsNotEmpty()
  transaction_from: string;

  @IsOptional()
  transaction_description: string;

  @IsDateString()
  transaction_date: string;

  @IsOptional()
  pocketId: string;

  @IsOptional()
  goalsId: string;

  @IsOptional()
  @IsFile()
  @HasMimeType(['image/jpeg', 'image/png']) // Accept only file image/jpeg or png
  @MaxFileSize(5 * 1024 * 1024) // Max file size 5MB
  attachment_file: MemoryStoredFile;
}
