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

  if (headers && Object.keys(headers).length) {
    const bearerToken = headers?.authorization as string | undefined | null;
    return bearerToken;
  }

  /*
    The following logic is mostly used for E2E testing. E2E tests use NestJS's RabbitMQ client,
    which typically serializes and buffers the headers in the content, as opposed to
    placing them as properties.

    Other services should continue to pass the token in the headers
  */
  try {
    const content = JSON.parse(message.content.toString()) as Record<
      string,
      any
    >;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const nestedHeaders =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      content?.options?.headers ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      content?.data?.options?.headers ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (content?.data?.headers as Record<string, string | null>);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return nestedHeaders.authorization as string | null | undefined;
  } catch {
    return null;
  }
}
