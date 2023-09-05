import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BrevoService {
  private api_key: string;
  private base_url: string;
  private verifyTemplateId: number;
  constructor(private config: ConfigService, private httpService: HttpService) {
    this.api_key = this.config.getOrThrow('BREVO_API_KEY');
    this.base_url = 'https://api.brevo.com/v3/smtp/email';
    this.verifyTemplateId = this.config.get('BREVO_VERIFY_EMAIL_TEMPLATE') || 3;
  }

  async sendVerifyEmail(
    to: string[],
    params: { verify_url: string; name: string },
  ) {
    return this.httpService.post<{ messageId: string }>(
      this.base_url,
      {
        to: to,
        templateId: this.verifyTemplateId,
        params,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.api_key,
        },
      },
    );
  }
}
