import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
      throw new BadRequestException('Failed upload file');
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
      throw new BadRequestException('Failed delete file');
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
      throw new BadRequestException('Failed get file metadata');
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
