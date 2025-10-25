import { ExecutionContext } from '@nestjs/common';
import { UserClaimsDto } from '../dto/user-claims.dto';
import { Mapper } from 'src/common/mapper/Mapper';
import { Request } from 'express';

export const user: UserClaimsDto = Mapper.auth.toUserClaims({
  id: '1',
  email: 'abc@abc.com',
});

export const httpExecutionContext = (request?: Request) =>
  ({
    switchToHttp() {
      return {
        getRequest() {
          return (
            request || {
              headers: {
                authorization: 'Bearer jwt',
              },
            }
          );
        },
      };
    },
    getType() {
      return 'http';
    },
  }) as unknown as ExecutionContext;

export const rpcExecutionContext = (data?: Record<string, unknown>) =>
  ({
    switchToRpc() {
      return {
        getContext() {
          return {
            getMessage() {
              return {
                properties: {
                  headers: {
                    authorization: 'Bearer jwt',
                  },
                },
              };
            },
          };
        },
        getData() {
          return data || {};
        },
      };
    },
    getType() {
      return 'rpc';
    },
  }) as unknown as ExecutionContext;
