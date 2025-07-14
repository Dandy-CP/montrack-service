import { Injectable } from '@nestjs/common';
import { DeleteFileDTO, UploadBodyDTO } from './dto/upload.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UploadService {
  constructor(private supabaseService: SupabaseService) {}

  async GetFileList(userId: string) {
    return await this.supabaseService.getFile(userId);
  }

  async UploadFiles(payload: UploadBodyDTO, userId?: string) {
    const { originalName, buffer } = payload.file;
    const fileName = `attachment-${userId}-${Date.now()}-${originalName}`;

    return await this.supabaseService.uploadFile(fileName, buffer);
  }

  async DeleteFiles(payload: DeleteFileDTO) {
    return await this.supabaseService.deleteFile(payload.file_name);
  }
}
