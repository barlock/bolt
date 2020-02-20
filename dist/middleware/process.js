"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function composeMiddleware(middleware) {
    return function (context) {
        // last called middleware #
        let index = -1;
        async function dispatch(order) {
            if (order < index) {
                return Promise.reject(new Error('next() called multiple times'));
            }
            index = order;
            let fn = middleware[order];
            if (order === middleware.length) {
                fn = context.next;
            }
            if (fn === null || fn === undefined) {
                return;
            }
            context.next = dispatch.bind(null, order + 1);
            return fn(context);
        }
        return dispatch(0);
    };
}
async function processMiddleware(middleware, context) {
    return composeMiddleware(middleware)({
        ...context,
        next: /* istanbul ignore next: Code can't be reached, noop instead of `null` for typing */ () => Promise.resolve(),
    });
}
exports.processMiddleware = processMiddleware;
//# sourceMappingURL=process.js.map