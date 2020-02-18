"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AppInitializationError"] = "slack_bolt_app_initialization_error";
    ErrorCode["AuthorizationError"] = "slack_bolt_authorization_error";
    ErrorCode["ContextMissingPropertyError"] = "slack_bolt_context_missing_property_error";
    ErrorCode["ReceiverAckTimeoutError"] = "slack_bolt_receiver_ack_timeout_error";
    ErrorCode["ReceiverAuthenticityError"] = "slack_bolt_receiver_authenticity_error";
    /**
     * This value is used to assign to errors that occur inside the framework but do not have a code, to keep interfaces
     * in terms of CodedError.
     */
    ErrorCode["UnknownError"] = "slack_bolt_unknown_error";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
function asCodedError(error) {
    if (error.code !== undefined) {
        return error;
    }
    return new UnknownError(error);
}
exports.asCodedError = asCodedError;
class AppInitializationError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.AppInitializationError;
    }
}
exports.AppInitializationError = AppInitializationError;
class AuthorizationError extends Error {
    constructor(message, original) {
        super(message);
        this.code = ErrorCode.AuthorizationError;
        this.original = original;
    }
}
exports.AuthorizationError = AuthorizationError;
class ContextMissingPropertyError extends Error {
    constructor(missingProperty, message) {
        super(message);
        this.code = ErrorCode.ContextMissingPropertyError;
        this.missingProperty = missingProperty;
    }
}
exports.ContextMissingPropertyError = ContextMissingPropertyError;
class ReceiverAckTimeoutError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.ReceiverAckTimeoutError;
    }
}
exports.ReceiverAckTimeoutError = ReceiverAckTimeoutError;
class ReceiverAuthenticityError extends Error {
    constructor() {
        super(...arguments);
        this.code = ErrorCode.ReceiverAuthenticityError;
    }
}
exports.ReceiverAuthenticityError = ReceiverAuthenticityError;
class UnknownError extends Error {
    constructor(original) {
        super(original.message);
        this.code = ErrorCode.UnknownError;
        this.original = original;
    }
}
exports.UnknownError = UnknownError;
//# sourceMappingURL=errors.js.map