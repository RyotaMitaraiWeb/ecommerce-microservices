import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AuthService],
  imports: [ConfigModule, JwtModule],
  exports: [AuthService],
})
export class AuthModule {}
