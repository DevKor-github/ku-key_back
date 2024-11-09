import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly mode: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_BUCKET_NAME');
    this.mode = process.env.NODE_ENV;
  }

  async uploadFile(
    file: Express.Multer.File,
    resource: string,
    path: string,
  ): Promise<string> {
    const splitedFileNames = file.originalname.split('.');
    const extension = splitedFileNames.at(splitedFileNames.length - 1);
    const filename = `${this.mode}/${resource}/${path}/${new Date().getTime()}.${extension}`;
    const params = {
      Key: filename,
      Body: file.buffer,
      Bucket: this.bucketName,
    };
    const command = new PutObjectCommand(params);

    const uploadFile = await this.s3.send(command);

    if (uploadFile.$metadata.httpStatusCode !== 200) {
      throwKukeyException('FILE_UPLOAD_FAILED');
    }

    return filename;
  }

  async uploadCompressedImage(
    file: Express.Multer.File,
    resource: string,
    path: string,
  ): Promise<string> {
    const image = sharp(file.buffer);

    const minWidth = 777;
    const minHeight = 437;

    const metadata = await image.metadata();
    const { width, height } = metadata;
    const resizeOptions =
      width > minWidth || height > minHeight
        ? { width: minWidth, height: minHeight, fit: sharp.fit.inside }
        : null;

    const isLargeImage = width > 2000 || height > 2000;
    const webpOptions = isLargeImage ? { quality: 75 } : { lossless: true };

    let processingImage = image;
    if (resizeOptions) {
      processingImage = processingImage.resize(resizeOptions);
    }

    const compressedBuffer = await processingImage.webp(webpOptions).toBuffer();

    const originalSize = file.buffer.length;
    const compressedSize = compressedBuffer.length;

    const finalBuffer =
      compressedSize < originalSize ? compressedBuffer : file.buffer;
    const finalContentType =
      compressedSize < originalSize ? 'image/webp' : file.mimetype;

    const filename = `${this.mode}/${resource}/${path}/${new Date().getTime()}.webp`;
    const params = {
      Key: filename,
      Body: finalBuffer,
      Bucket: this.bucketName,
      ContentType: finalContentType,
    };

    const command = new PutObjectCommand(params);
    const uploadFile = await this.s3.send(command);

    if (uploadFile.$metadata.httpStatusCode !== 200) {
      throwKukeyException('FILE_UPLOAD_FAILED');
    }

    return filename;
  }

  async deleteFile(filename: string): Promise<void> {
    const params = {
      Key: filename,
      Bucket: this.bucketName,
    };
    console.log(params);
    const command = new DeleteObjectCommand(params);

    const deleteFile = await this.s3.send(command);
    console.log(deleteFile);

    if (deleteFile.$metadata.httpStatusCode !== 204) {
      throwKukeyException('FILE_DELETE_FAILED');
    }
  }

  // S3 내 특정 경로의 파일 URL들을 가져오는 함수
  async getFileUrls(prefix: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    const response = await this.s3.send(command);

    if (response.$metadata.httpStatusCode !== 200) {
      throwKukeyException('FILE_METADATA_GET_FAILED');
    }

    if (!response.Contents) {
      return [];
    }

    return response.Contents.filter((object) => this.isFile(object.Key)).map(
      (object) => {
        return this.makeUrlByFileDir(object.Key);
      },
    );
  }

  // 파일 확장자가 있는 경우에만 true를 반환
  isFile(key: string): boolean {
    return !!key.split('/').pop().includes('.');
  }

  imagefilter(file: Express.Multer.File): boolean {
    const filetype = file.mimetype.split('/');
    return filetype[0] === 'image';
  }

  makeUrlByFileDir(fileDir: string): string {
    return (
      `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.${this.configService.get('AWS_BUCKET_REGION')}.amazonaws.com/` +
      fileDir
    );
  }

  getFileDirFromUrl(url: string): string {
    const baseUrl = `https://${this.configService.get('AWS_BUCKET_NAME')}.s3.${this.configService.get('AWS_BUCKET_REGION')}.amazonaws.com/`;
    return url.slice(baseUrl.length);
  }
}
