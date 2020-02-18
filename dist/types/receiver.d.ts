import { AckFn } from '../types';
import { StringIndexed } from './helpers';
import { CodedError, ErrorCode } from '../errors';
export interface ReceiverEvent {
    body: StringIndexed;
    ack: AckFn<any>;
}
export interface Receiver {
    on(event: 'message', listener: (event: ReceiverEvent) => void): unknown;
    on(event: 'error', listener: (error: Error | ReceiverAckTimeoutError) => void): unknown;
    start(...args: any[]): Promise<unknown>;
    stop(...args: any[]): Promise<unknown>;
}
export interface ReceiverAckTimeoutError extends CodedError {
    code: ErrorCode.ReceiverAckTimeoutError;
}
//# sourceMappingURL=receiver.d.ts.map