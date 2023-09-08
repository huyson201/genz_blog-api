import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Image } from '../schemas/Image.schema';

@Injectable()
export class FileService {
  constructor(
    private cloudinary: CloudinaryService,
    @InjectModel(Image.name) private ImageModel: Model<Image>,
  ) {}

  async uploadSingle(file: Express.Multer.File, auth: AuthData) {
    try {
      const results = await this.cloudinary.uploadImage(file);
      const img = new this.ImageModel({
        user: auth._id,
        public_id: results.public_id,
        width: results.width,
        height: results.height,
        format: results.format,
        url: results.url,
        secure_url: results.secure_url,
        original_filename: results.original_filename,
        resource_type: results.resource_type,
        type: results.type,
      });
      await img.save();
      return img;
    } catch (error) {
      throw error;
    }
  }

  async uploadMultiple(files: Array<Express.Multer.File>, auth: AuthData) {
    try {
      const results = await Promise.all(
        files.map((file) => this.cloudinary.uploadImage(file)),
      );
      const imgs = await this.ImageModel.insertMany(
        results.map((result) => {
          const {
            public_id,
            url,
            secure_url,
            format,
            width,
            height,
            original_filename,
            resource_type,
            type,
          } = result;
          return {
            public_id,
            url,
            secure_url,
            format,
            width,
            height,
            original_filename,
            resource_type,
            type,
            user: auth._id,
          };
        }),
      );
      return imgs;
    } catch (error) {
      throw error;
    }
  }

  async delete(publicId: string, auth: AuthData) {
    try {
      await this.cloudinary.deleteImage(publicId);
      const result = await this.ImageModel.deleteOne({
        public_id: publicId,
        user: auth._id,
      }).exec();
      return { result: 'ok' };
    } catch (error) {
      throw error;
    }
  }

  async deleteMultiple(publicIds: string[], auth: AuthData) {
    try {
      await Promise.all(publicIds.map((id) => this.cloudinary.deleteImage(id)));
      await this.ImageModel.deleteMany({
        user: auth._id,
        public_id: { $in: publicIds },
      }).exec();
      return { result: 'ok' };
    } catch (error) {
      throw error;
    }
  }

  async getAllImage(auth: AuthData) {
    try {
      const imgs = await this.ImageModel.find({ user: auth._id });
      return imgs;
    } catch (error) {
      throw error;
    }
  }
}
