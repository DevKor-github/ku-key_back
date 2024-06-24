import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as deepl from 'deepl-node';

@Injectable()
export class TranslateService {
  private translator: deepl.Translator;

  constructor(private readonly configService: ConfigService) {
    this.translator = new deepl.Translator(
      this.configService.get('DEEPL_API_KEY'),
    );
  }

  async translateToEng(text: string): Promise<string> {
    const result = await this.translator.translateText(text, null, 'en-US');
    return result.text;
  }

  async translateToKor(text: string): Promise<string> {
    const result = await this.translator.translateText(text, null, 'ko');
    return result.text;
  }
}
