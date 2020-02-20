"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const raw_body_1 = __importDefault(require("raw-body"));
const querystring_1 = __importDefault(require("querystring"));
const crypto_1 = __importDefault(require("crypto"));
const tsscmp_1 = __importDefault(require("tsscmp"));
const errors_1 = require("./errors");
const logger_1 = require("@slack/logger");
/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
class ExpressReceiver {
    constructor({ signingSecret = '', logger = new logger_1.ConsoleLogger(), endpoints = { events: '/slack/events' }, }) {
        this.app = express_1.default();
        this.app.use(this.errorHandler.bind(this));
        // TODO: what about starting an https server instead of http? what about other options to create the server?
        this.server = http_1.createServer(this.app);
        const expressMiddleware = [
            verifySignatureAndParseRawBody(logger, signingSecret),
            exports.respondToSslCheck,
            exports.respondToUrlVerification,
            this.requestHandler.bind(this),
        ];
        const endpointList = typeof endpoints === 'string' ? [endpoints] : Object.values(endpoints);
        for (const endpoint of endpointList) {
            this.app.post(endpoint, ...expressMiddleware);
        }
    }
    async requestHandler(req, res) {
        var _a;
        let timer = setTimeout(() => {
            var _a;
            (_a = this.bolt) === null || _a === void 0 ? void 0 : _a.handleError(new errors_1.ReceiverAckTimeoutError('An incoming event was not acknowledged before the timeout. ' +
                'Ensure that the ack() argument is called in your listeners.'));
            timer = undefined;
        }, 2800);
        const event = {
            body: req.body,
            ack: async (response) => {
                var _a;
                if (timer !== undefined) {
                    clearTimeout(timer);
                    timer = undefined;
                    if (!response) {
                        res.send('');
                    }
                    else if (typeof response === 'string') {
                        res.send(response);
                    }
                    else {
                        res.json(response);
                    }
                }
                else {
                    (_a = this.bolt) === null || _a === void 0 ? void 0 : _a.handleError(new errors_1.ReceiverMultipleAckError());
                }
            },
        };
        try {
            await ((_a = this.bolt) === null || _a === void 0 ? void 0 : _a.processEvent(event));
        }
        catch (err) {
            res.send(500);
            throw err;
        }
    }
    init(bolt) {
        this.bolt = bolt;
    }
    // TODO: the arguments should be defined as the arguments of Server#listen()
    // TODO: the return value should be defined as a type that both http and https servers inherit from, or a union
    start(port) {
        return new Promise((resolve, reject) => {
            try {
                // TODO: what about other listener options?
                // TODO: what about asynchronous errors? should we attach a handler for this.server.on('error', ...)?
                // if so, how can we check for only errors related to listening, as opposed to later errors?
                this.server.listen(port, () => {
                    resolve(this.server);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    // TODO: the arguments should be defined as the arguments to close() (which happen to be none), but for sake of
    // generic types
    stop() {
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
    errorHandler(err, _req, _res, next) {
        var _a;
        (_a = this.bolt) === null || _a === void 0 ? void 0 : _a.handleError(err);
        // Forward to express' default error handler (which knows how to print stack traces in development)
        next(err);
    }
}
exports.default = ExpressReceiver;
exports.respondToSslCheck = (req, res, next) => {
    if (req.body && req.body.ssl_check) {
        res.send();
        return;
    }
    next();
};
exports.respondToUrlVerification = (req, res, next) => {
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
function verifySignatureAndParseRawBody(logger, signingSecret) {
    return async (req, res, next) => {
        let stringBody;
        // On some environments like GCP (Google Cloud Platform),
        // req.body can be pre-parsed and be passed as req.rawBody here
        const preparsedRawBody = req.rawBody;
        if (preparsedRawBody !== undefined) {
            stringBody = preparsedRawBody.toString();
        }
        else {
            stringBody = (await raw_body_1.default(req)).toString();
        }
        // *** Parsing body ***
        // As the verification passed, parse the body as an object and assign it to req.body
        // Following middlewares can expect `req.body` is already a parsed one.
        try {
            // This handler parses `req.body` or `req.rawBody`(on Google Could Platform)
            // and overwrites `req.body` with the parsed JS object.
            req.body = verifySignatureAndParseBody(signingSecret, stringBody, req.headers);
        }
        catch (error) {
            if (error) {
                if (error instanceof errors_1.ReceiverAuthenticityError) {
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
exports.verifySignatureAndParseRawBody = verifySignatureAndParseRawBody;
function logError(logger, message, error) {
    const logMessage = ('code' in error)
        ? `${message} (code: ${error.code}, message: ${error.message})`
        : `${message} (error: ${error})`;
    logger.warn(logMessage);
}
function verifyRequestSignature(signingSecret, body, signature, requestTimestamp) {
    if (signature === undefined || requestTimestamp === undefined) {
        throw new errors_1.ReceiverAuthenticityError('Slack request signing verification failed. Some headers are missing.');
    }
    const ts = Number(requestTimestamp);
    if (isNaN(ts)) {
        throw new errors_1.ReceiverAuthenticityError('Slack request signing verification failed. Timestamp is invalid.');
    }
    // Divide current date to match Slack ts format
    // Subtract 5 minutes from current time
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);
    if (ts < fiveMinutesAgo) {
        throw new errors_1.ReceiverAuthenticityError('Slack request signing verification failed. Timestamp is too old.');
    }
    const hmac = crypto_1.default.createHmac('sha256', signingSecret);
    const [version, hash] = signature.split('=');
    hmac.update(`${version}:${ts}:${body}`);
    if (!tsscmp_1.default(hash, hmac.digest('hex'))) {
        throw new errors_1.ReceiverAuthenticityError('Slack request signing verification failed. Signature mismatch.');
    }
}
/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
function verifySignatureAndParseBody(signingSecret, body, headers) {
    // *** Request verification ***
    const { 'x-slack-signature': signature, 'x-slack-request-timestamp': requestTimestamp, 'content-type': contentType, } = headers;
    verifyRequestSignature(signingSecret, body, signature, requestTimestamp);
    return parseRequestBody(body, contentType);
}
function parseRequestBody(stringBody, contentType) {
    if (contentType === 'application/x-www-form-urlencoded') {
        const parsedBody = querystring_1.default.parse(stringBody);
        if (typeof parsedBody.payload === 'string') {
            return JSON.parse(parsedBody.payload);
        }
        return parsedBody;
    }
    return JSON.parse(stringBody);
}
//# sourceMappingURL=ExpressReceiver.js.map