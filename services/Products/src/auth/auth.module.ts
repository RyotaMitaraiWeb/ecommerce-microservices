import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth/auth.guard';
import { AuthRpcGuard } from './guards/auth-rpc/auth-rpc.guard';

@Module({
  providers: [AuthService, AuthGuard, AuthRpcGuard],
  imports: [ConfigModule, JwtModule],
  exports: [AuthGuard, AuthRpcGuard],
})
export class AuthModule {}
