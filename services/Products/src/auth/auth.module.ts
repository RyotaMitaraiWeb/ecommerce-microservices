import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth/auth.guard';

@Module({
  providers: [AuthService, AuthGuard],
  imports: [ConfigModule, JwtModule],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
