import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { UploadService } from './upload.service';
import { DeleteFileDTO, UploadBodyDTO } from './dto/upload.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { GetUser } from '../auth/decorators/user.decorator';
import { JWTPayloadUser } from 'src/auth/interface/authResponse.interface';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('/file-list')
  GetFilesList(
    @Query('fileName') fileName: string,
    @GetUser() user: JWTPayloadUser,
  ) {
    return this.uploadService.GetFileList(user.user_id);
  }

  @Post('/upload')
  @FormDataRequest()
  UploadFile(@Body() payload: UploadBodyDTO, @GetUser() user: JWTPayloadUser) {
    return this.uploadService.UploadFiles(payload, user.user_id);
  }

  @Delete('/delete')
  DeleteFile(@Body() payload: DeleteFileDTO) {
    return this.uploadService.DeleteFiles(payload);
  }
}
