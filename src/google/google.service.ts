import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;
  constructor(private config: ConfigService) {
    this.oauth2Client = new OAuth2Client({
      clientId: this.config.getOrThrow('GOOGLE_CLIENT_ID'),
    });
  }

  async verifyIdToken(idToken: string) {
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: this.config.getOrThrow('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    const userId = ticket.getUserId();
    return { payload, userId };
  }
}
