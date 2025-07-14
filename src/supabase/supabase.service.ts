import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  public readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_KEY ?? '',
      {
        auth: {
          persistSession: false,
        },
      },
    );
  }

  async getFile(userId: string) {
    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME ?? '')
      .list(undefined, { search: `attachment-${userId}` });

    if (error) {
      throw new UnprocessableEntityException(error);
    }

    return data;
  }

  async uploadFile(filePath: string, file: Buffer) {
    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME ?? '')
      .upload(filePath, file, { upsert: true });

    if (error) {
      throw new UnprocessableEntityException(error);
    }

    // re-assign with new full path value
    data.fullPath = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/${data.path}`;

    return data;
  }

  async deleteFile(fileName: string) {
    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME ?? '')
      .remove([fileName]);

    if (error) {
      throw new UnprocessableEntityException(error);
    }

    return data;
  }
}
