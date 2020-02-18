import { StringIndexed } from './helpers';
import { SlackEventMiddlewareArgs } from './events';
import { SlackActionMiddlewareArgs } from './actions';
import { SlackCommandMiddlewareArgs } from './command';
import { SlackOptionsMiddlewareArgs } from './options';
import { SlackViewMiddlewareArgs } from './view';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/logger';
export declare type AnyMiddlewareArgs = SlackEventMiddlewareArgs | SlackActionMiddlewareArgs | SlackCommandMiddlewareArgs | SlackOptionsMiddlewareArgs | SlackViewMiddlewareArgs;
export interface Context extends StringIndexed {
}
export declare type ProcessMiddlewareContext<Args> = Args & {
    next?: NextMiddleware;
    context: Context;
    logger: Logger;
    client: WebClient;
};
export declare type MiddlewareContext<Args> = ProcessMiddlewareContext<Args> & {
    next: NextMiddleware;
};
export interface Middleware<Args> {
    (ctx: MiddlewareContext<Args>): Promise<unknown>;
}
export declare type NextMiddleware = () => Promise<unknown>;
//# sourceMappingURL=middleware.d.ts.map