import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BrevoService } from '../brevo/brevo.service';

@Processor('send-mail')
export class MailConsumer {
  constructor(private broveService: BrevoService) {}

  @Process('verify-mail')
  async sendMail(job: Job<SendVerifyEmailData>) {
    const { to, verify_url, name } = job.data;
    const res = await this.broveService.sendVerifyEmail(to, {
      verify_url,
      name,
    });
    return res;
  }
}
