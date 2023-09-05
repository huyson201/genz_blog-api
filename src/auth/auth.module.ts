import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DBUserModule } from 'src/database/DB.User.module';
import { JwtModule } from '@nestjs/jwt';
import { MailConsumer } from 'src/consumers/mail.consumer';
@Module({
  imports: [
    DBUserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configs: ConfigService) {
        return {
          secret: configs.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2d',
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'send-mail',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailConsumer],
})
export class AuthModule {}
