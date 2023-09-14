import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DBUserModule } from '../database/DB.User.module';
import { JwtModule } from '@nestjs/jwt';
import { MailConsumer } from '../consumers/mail.consumer';
import { BrevoService } from '../brevo/brevo.service';
import { DBPostModule } from 'src/database/DB.Post.module';
@Module({
  imports: [
    DBUserModule,
    DBPostModule,
    BullModule.registerQueue({
      name: 'send-mail',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory(configs: ConfigService) {
        return {
          secret: configs.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configs.get('JWT_EXPIRE'),
          },
        };
      },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailConsumer, BrevoService],
})
export class AuthModule {}
