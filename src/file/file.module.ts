import { DBImageModule } from 'src/database/DB.Image.module';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [DBImageModule],
  controllers: [FileController],
  providers: [FileService, CloudinaryService],
})
export class FileModule {}
