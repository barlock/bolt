"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const tsscmp_1 = __importDefault(require("tsscmp"));
const querystring_1 = __importDefault(require("querystring"));
const errors_1 = require("./errors");
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
exports.verifyRequestSignature = verifyRequestSignature;
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
exports.verifySignatureAndParseBody = verifySignatureAndParseBody;
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
exports.parseRequestBody = parseRequestBody;
//# sourceMappingURL=receiver.js.map