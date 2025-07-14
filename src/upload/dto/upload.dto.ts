import { IsNotEmpty, IsString } from 'class-validator';
import { IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class UploadBodyDTO {
  @IsNotEmpty()
  @IsFile()
  file: MemoryStoredFile;
}

export class DeleteFileDTO {
  @IsNotEmpty()
  @IsString()
  file_name: string;
}
