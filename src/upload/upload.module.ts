import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [NestjsFormDataModule, SupabaseModule],
  controllers: [UploadController],
  providers: [UploadService, SupabaseService],
})
export class UploadModule {}
