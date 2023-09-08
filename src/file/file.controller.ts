import { DeleteFileDto } from './dto/DeleteFile.dto';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  HttpCode,
  Delete,
  Body,
  UploadedFile,
  UseGuards,
  Get,
} from '@nestjs/common';

import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AuthGuard } from '../guards/Auth.guard';
import { User } from '../decorators/user.decorator';
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  getAll(@User() auth: AuthData) {
    return this.fileService.getAllImage(auth);
  }

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  uploadSingle(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp(/(png|jgp|jpeg)/i),
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
    @User() auth: AuthData,
  ) {
    return this.fileService.uploadSingle(file, auth);
  }

  @Post('/uploads')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images[]'))
  uploadImages(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp(/(png|jgp|jpeg)/i),
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    files: Array<Express.Multer.File>,
    @User() auth: AuthData,
  ) {
    console.log(files);
    return this.fileService.uploadMultiple(files, auth);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  delete(@Body() dto: DeleteFileDto, @User() auth: AuthData) {
    return this.fileService.delete(dto.publicId, auth);
  }
}
