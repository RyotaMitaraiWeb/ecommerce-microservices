import { ExecutionContext } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ConsumeMessage } from 'amqplib';
import type { Request } from 'express';

export function extractBearerTokenFromExecutionContext(
  context: ExecutionContext,
) {
  const requestType = context.getType();
  switch (requestType) {
    case 'http':
      return extractBearerTokenFromHttpRequest(context);
    case 'rpc':
      return extractBearerTokenFromRpcRequest(context);
    default:
      throw new Error('Invalid or unsupported request type');
  }
}

function extractBearerTokenFromHttpRequest(context: ExecutionContext) {
  const request = context.switchToHttp().getRequest<Request>();
  const bearerToken = request.headers.authorization;

  return bearerToken;
}

function extractBearerTokenFromRpcRequest(context: ExecutionContext) {
  const rmqContext = context.switchToRpc().getContext<RmqContext>();
  const message = rmqContext.getMessage() as ConsumeMessage;
  const headers = message.properties.headers;
  const bearerToken = headers?.authorization as string | undefined | null;
  return bearerToken;
}
