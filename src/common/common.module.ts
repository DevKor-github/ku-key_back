import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { EmailService } from './email.service';

@Module({
  providers: [FileService, EmailService],
  exports: [FileService, EmailService],
})
export class CommonModule {}