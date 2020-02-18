import { createServer, Server } from 'http';
import express, { Request, Response, Application, RequestHandler, NextFunction } from 'express';
import rawBody from 'raw-body';
import App from './App';
import { verifySignatureAndParseBody, Receiver, ReceiverEvent } from './receiver';
import { ReceiverAuthenticityError } from './errors';
import { Logger, ConsoleLogger } from '@slack/logger';

// TODO: we throw away the key names for endpoints, so maybe we should use this interface. is it better for migrations?
// if that's the reason, let's document that with a comment.
export interface ExpressReceiverOptions {
  signingSecret: string;
  logger?: Logger;
  endpoints?: string | {
    [endpointType: string]: string;
  };
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
export default class ExpressReceiver implements Receiver {

  /* Express app */
  public app: Application;

  private server: Server;
  private bolt: App | undefined;

  constructor({
    signingSecret = '',
    logger = new ConsoleLogger(),
    endpoints = { events: '/slack/events' },
  }: ExpressReceiverOptions) {
    this.app = express();
    this.app.use(this.errorHandler.bind(this));
    // TODO: what about starting an https server instead of http? what about other options to create the server?
    this.server = createServer(this.app);

    const expressMiddleware: RequestHandler[] = [
      verifySignatureAndParseRawBody(logger, signingSecret),
      respondToSslCheck,
      respondToUrlVerification,
      this.requestHandler.bind(this),
    ];

    const endpointList: string[] = typeof endpoints === 'string' ? [endpoints] : Object.values(endpoints);
    for (const endpoint of endpointList) {
      this.app.post(endpoint, ...expressMiddleware);
    }
  }

  private async requestHandler(req: Request, res: Response): Promise<void> {
    let timer: NodeJS.Timer | undefined = setTimeout(
      () => {
        this.bolt?.handleError(new ReceiverAuthenticityError(
          'An incoming event was not acknowledged before the timeout. ' +
          'Ensure that the ack() argument is called in your listeners.',
        ));
        timer = undefined;
      },
      2800,
    );
    const event: ReceiverEvent = {
      body: req.body,
      ack: async (response): Promise<void> => {
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;

          if (response instanceof Error) {
            res.send(500);
          } else if (!response) {
            res.send('');
          } else if (typeof response === 'string') {
            res.send(response);
          } else {
            res.json(response);
          }
        }
      },
    };

    await this.bolt?.processEvent(event);
  }

  public init(bolt: App): void {
    this.bolt = bolt;
  }

    // TODO: the arguments should be defined as the arguments of Server#listen()
  // TODO: the return value should be defined as a type that both http and https servers inherit from, or a union
  public start(port: number): Promise<Server> {
    return new Promise((resolve, reject) => {
      try {
        // TODO: what about other listener options?
        // TODO: what about asynchronous errors? should we attach a handler for this.server.on('error', ...)?
        // if so, how can we check for only errors related to listening, as opposed to later errors?
        this.server.listen(port, () => {
          resolve(this.server);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // TODO: the arguments should be defined as the arguments to close() (which happen to be none), but for sake of
  // generic types
  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      // TODO: what about synchronous errors?
      this.server.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  private errorHandler(err: any, _req: Request, _res: Response, next: NextFunction): void {
    this.bolt?.handleError(err);
    // Forward to express' default error handler (which knows how to print stack traces in development)
    next(err);
  }
}

export const respondToSslCheck: RequestHandler = (req, res, next) => {
  if (req.body && req.body.ssl_check) {
    res.send();
    return;
  }
  next();
};

export const respondToUrlVerification: RequestHandler = (req, res, next) => {
  if (req.body && req.body.type && req.body.type === 'url_verification') {
    res.json({ challenge: req.body.challenge });
    return;
  }
  next();
};

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
export function verifySignatureAndParseRawBody(
  logger: Logger,
  signingSecret: string,
): RequestHandler {
  return async (req, res, next) => {

    let stringBody: string;
    // On some environments like GCP (Google Cloud Platform),
    // req.body can be pre-parsed and be passed as req.rawBody here
    const preparsedRawBody: any = (req as any).rawBody;
    if (preparsedRawBody !== undefined) {
      stringBody = preparsedRawBody.toString();
    } else {
      stringBody = (await rawBody(req)).toString();
    }

    // *** Parsing body ***
    // As the verification passed, parse the body as an object and assign it to req.body
    // Following middlewares can expect `req.body` is already a parsed one.

    try {
      // This handler parses `req.body` or `req.rawBody`(on Google Could Platform)
      // and overwrites `req.body` with the parsed JS object.
      req.body = verifySignatureAndParseBody(signingSecret, stringBody, req.headers);
    } catch (error) {
      if (error) {
        if (error instanceof ReceiverAuthenticityError) {
          logError(logger, 'Request verification failed', error);
          return res.status(401).send();
        }

        logError(logger, 'Parsing request body failed', error);
        return res.status(400).send();
      }
    }

    return next();
  };
}

function logError(logger: Logger, message: string, error: any): void {
  const logMessage = ('code' in error)
    ? `${message} (code: ${error.code}, message: ${error.message})`
    : `${message} (error: ${error})`;
  logger.warn(logMessage);
}
