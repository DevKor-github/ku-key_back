import { PipeTransform } from '@nestjs/common';
import * as Sharp from 'sharp';

const MAX_WIDTH = 777;
const MAX_HEIGHT = 437;

export class ResizeImagePipe implements PipeTransform {
  isSingleFile(value: any): value is Express.Multer.File {
    return value && 'fieldname' in value && 'originalname' in value;
  }

  async transform(value: Express.Multer.File | Express.Multer.File[]) {
    if (this.isSingleFile(value)) {
      return await this.ifImageThanResize(value);
    } else {
      const result: Express.Multer.File[] = [];
      for (const file of value) {
        result.push(await this.ifImageThanResize(file));
      }

      return result;
    }
  }

  async ifImageThanResize(
    value: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    const filetype = value.mimetype.split('/');
    if (filetype[0] === 'image') {
      value = await this.resizeImage(value);
    }
    return value;
  }

  async resizeImage(value: Express.Multer.File) {
    const { width, height } = await Sharp(value.buffer).metadata();

    if (width < MAX_WIDTH && height < MAX_HEIGHT) {
      return value;
    }

    const resizeOption =
      width / MAX_WIDTH >= height / MAX_HEIGHT
        ? { width: MAX_WIDTH }
        : { height: MAX_HEIGHT };

    const buffer = await Sharp(value.buffer).resize(resizeOption).toBuffer();

    value.buffer = buffer;

    return value;
  }
}
