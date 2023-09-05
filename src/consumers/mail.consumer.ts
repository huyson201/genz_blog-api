import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { BrevoService } from 'src/brevo/brevo.service';

@Processor('send-mail')
export class MailConsumer {
  constructor(private broveService: BrevoService) {}

  @Process('verify-mail')
  async sendMail(job: Job<{ to: string[]; verify_url: string; name: string }>) {
    const { to, verify_url, name } = job.data;
    return this.broveService.sendVerifyEmail(to, { verify_url, name });
  }
}
