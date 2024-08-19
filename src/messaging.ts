export type MessageType =
  | 'order.created'
  | 'order.error'
  | 'payment.failed'
  | 'location.updated'
  | 'auth.updated'
  | 'auth.redirect'
  | 'app.loaded';

export interface BaseMessage<T extends MessageType, P extends Record<string, unknown>> {
  event: T;
  payload: P;
}

interface OrderCreatedMessage extends BaseMessage<'order.created', {orderId: string}> {}
interface OrderErrorMessage extends BaseMessage<'order.error', {error: string}> {}
interface PaymentFailedMessage extends BaseMessage<'payment.failed', {paymentSessionId: string}> {}
interface LocationUpdatedMessage extends BaseMessage<'location.updated', {location: string}> {}
interface AuthUpdatedMessage extends BaseMessage<'auth.updated', {isLoggedIn: boolean}> {}
interface AuthRedirectMessage extends BaseMessage<'auth.redirect', {url: string}> {}
interface AppLoadedMessage extends BaseMessage<'app.loaded', never> {}

export type Message =
  | OrderCreatedMessage
  | OrderErrorMessage
  | PaymentFailedMessage
  | LocationUpdatedMessage
  | AuthUpdatedMessage
  | AuthRedirectMessage
  | AppLoadedMessage;

function isBaseMessage<T extends MessageType, P extends Record<string, unknown>>(
  message: unknown,
): message is BaseMessage<T, P> {
  return (
    typeof message === 'object' &&
    message !== null &&
    'event' in message &&
    'payload' in message &&
    typeof message.event === 'string' &&
    typeof message.payload === 'object'
  );
}

function validateMessageType(event: string): event is MessageType {
  return [
    'order.created',
    'order.error',
    'payment.failed',
    'location.updated',
    'auth.updated',
    'auth.redirect',
    'app.loaded',
  ].includes(event);
}

export const validateMessage = (message: unknown): message is Message => {
  if (!isBaseMessage(message)) {
    return false;
  }
  if (!validateMessageType(message.event)) {
    return false;
  }
  switch (message.event) {
    case 'order.created':
      return 'orderId' in message.payload && typeof message.payload.orderId === 'string';
    case 'order.error':
      return typeof message.payload.error === 'string';
    case 'payment.failed':
      return typeof message.payload.paymentSessionId === 'string';
    case 'location.updated':
      return typeof message.payload.location === 'string';
    case 'auth.updated':
      return typeof message.payload.isLoggedIn === 'boolean';
    case 'auth.redirect':
      return typeof message.payload.url === 'string';
    case 'app.loaded':
      return Object.keys(message.payload).length === 0;
    default:
      return false;
  }
};
