import 'mocha';
import { assert } from 'chai';
import { App, ExpressReceiver } from './index';
import serverless from 'serverless-http';
import {
  delay,
  createFakeMessageEvent,
  createEventRequest,
  importAppWithMockSlackClient,
} from "./test-helpers";

describe('Demonstration of downstream testing', () => {
  let app: App;
  let handler: any;
  let request: any;
  const message = 'Oh Hai';

  beforeEach(async () => {
    const receiver = new ExpressReceiver({ signingSecret: 'SECRET' });
    const RewiredApp = await importAppWithMockSlackClient();

    app = new RewiredApp({ receiver, token: '' });

    // Possibly this wrapper isn't the right one.
    // See https://community.slack.com/archives/CHY642221/p1575577886047900 for details.
    // This wrapper should take an event and return a promise with a response when its
    // event loop has completed
    handler = serverless(receiver.app);

    const event = createFakeMessageEvent(message);
    request = createEventRequest(event);
  });

  it('correctly waits for async listeners', async () => {
    let changed = false;

    app.message(message, async ({ next }) => {
      await delay(100);
      changed = true;

      next();
    });

    const response = await handler(request);

    assert.equal(response.statusCode, 200);
    assert.isTrue(changed); // Actual `true`
  });

  it('can catch thrown errors in downstream async listeners', async () => {
    app.message('Hai', async ({next}) => {
      const error =  new Error('Something terrible happened!');

      // real "async" middleware wouldn't do this, but I would have expected this to work.
      next(error);

      // Nothing catches this up the stack, this is what async middleware is likely doing
      throw error;
    });

    app.error(() => {
      // This is never called, I do agree that middleware should handle its own errors.
      // Having a handler can be helpful for strange, unexpected ones.
    });

    const event = createFakeMessageEvent(message);
    const request = createEventRequest(event);

    const response = await handler(request);

    assert.equal(response.statusCode, 500); // Actual 200
  });

  it('Calls async middleware in a nested, declared first, order', async () => {
    let orderCount = 1;

    const assertOrderMiddleware = (order: number) =>  async ({ next }: any) => {
      await delay(100);
      assert.equal(orderCount, order);
      orderCount += 1;
      next();
    };

    app.use(assertOrderMiddleware(1));

    app.message(message, assertOrderMiddleware(2), assertOrderMiddleware(3));

    // This middleware is never called, the middleware does a thing where if it
    // detects a message (3 in this case) as "last" it will give it a noop
    // instead of a real callback. Possibly interesting cases could be handled
    // if everything is connected. I discovered this by trying to polyfill bolt sticking
    // a handler here to possibly find when the event loop was done.
    //
    // A real use case would be having a message set a `state` in its context and a
    // handler here saving it to a db
    app.use(assertOrderMiddleware(4));

    await handler(request);

    // This should be removable, without it none of the middleware is called
    await delay(600);

    assert.equal(orderCount, 5); // Actual 4
  });
});

// It would be really awesome to release a new package, possibly `bolt-test` with a
// bunch of supported helpers/tools for easy testing of bolt apps.
// Things that would be neat:
//   1. Some kind of wrapper function like `serverless-http` or a receiver that could be plugged in
//   2. Api fixture generators. What is the structure of the json being sent with each event type?
//   3. Mock Slack Client. No one wants production slack being hit in test cases.
//      Also a supported way to "rewire" or pass it in, or something.

// How I'd like to write fully async apps using koa-style middleware
// @ts-ignore - This and the rest are changing signatures for consistency w/ koa, this wont run
function exampleToContainScope() {  // tslint:disable:typedef
  const app = new App();

  // @ts-ignore
  app.use(async (ctx, next) => {
    // Do some kind of async work down the chain
    const start = Date.now();

    // Pass to the next middleware
    await next();

    // Do some kind of async work up the chain
    const end = Date.now();

    // Do something with the results
    console.log(`Request took ${end - start}ms`);
  });

  // @ts-ignore
  app.message(
      'Oh Hai!',
      // @ts-ignore
      async (ctx, next) => {
        // Another example of async work going down and up the chain.
        // In this case it would be executed before the one above it in both cases.
        // In a real app it very likely wouldn't be the exact same functionality.
        // This is just an example.
        const start = Date.now();
        await next();
        const end = Date.now();

        console.log(`Message took ${end - start}ms`);
      },
      // @ts-ignore
      async ({ say, body }, next) => {
        await say(`You said ${body.text}`);
        await next();
      },
  );

  app.message('Throw an error', async () => {
    throw new Error('Wow, such error!');
  });

  const doAsyncProcessing = async () => {
    await delay(100);

    return 'Wow that took a while to do that thing!';
  };

  // @ts-ignore
  app.action(async ({ ack, respond }, next) => {
    const [asyncProcessingResult] = await Promise.all([doAsyncProcessing(), ack()]);

    await respond(asyncProcessingResult);
    await next();
  });

  app.error(async (error) => {
    console.error(error);
    await delay(100); // Possibly attempt some graceful async shutdowns
  });
}
