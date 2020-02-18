import App from './App';
import { AckFn, AnyMiddlewareArgs } from './types';
export interface ReceiverEvent {
    body: Record<string, any>;
    ack: AckFn<any>;
}
export interface Receiver {
    init(app: App): void;
    start(...args: any[]): Promise<unknown>;
    stop(...args: any[]): Promise<unknown>;
}
export declare function verifyRequestSignature(signingSecret: string, body: string, signature: string | undefined, requestTimestamp: string | undefined): void;
/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
export declare function verifySignatureAndParseBody(signingSecret: string, body: string, headers: Record<string, any>): AnyMiddlewareArgs['body'];
export declare function parseRequestBody(stringBody: string, contentType: string | undefined): any;
//# sourceMappingURL=receiver.d.ts.map