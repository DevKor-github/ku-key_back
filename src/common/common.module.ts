import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { EmailService } from './email.service';
import { TranslateService } from './translate.service';

@Module({
  providers: [FileService, EmailService, TranslateService],
  exports: [FileService, EmailService, TranslateService],
})
export class CommonModule {}
