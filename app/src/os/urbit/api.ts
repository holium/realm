import EventEmitter from 'events';
import EventSource from 'eventsource';

import axios from 'axios';

// -----------------------------------------
// -- modified version of @urbit/http-api --
// -----------------------------------------

import {
  Scry,
  Thread,
  AuthenticationInterface,
  PokeInterface,
  SubscriptionRequestInterface,
  headers,
  SSEOptions,
  PokeHandlers,
  Message,
  FatalError,
} from './types';
import { hexString } from './utils';
import { SendAction, RealmAction } from './action-types';

/**
 * A class for interacting with an urbit ship, given its URL and code
 */
export class Urbit extends EventEmitter {
  private url: string = '';
  /**
   * UID will be used for the channel: The current unix time plus a random hex string
   */
  private uid: string = `${Math.floor(Date.now() / 1000)}-${hexString(6)}`;

  /**
   * Last Event ID is an auto-updated index of which events have been sent over this channel
   */
  private lastEventId: number = 0;

  private lastAcknowledgedEventId: number = 0;

  /**
   * SSE Client is null for now; we don't want to start polling until it the channel exists
   */
  private sseClientInitialized: boolean = false;

  private code?: string;

  /**
   * Cookie gets set when we log in.
   */
  cookie: string;

  /**
   * A registry of requestId to successFunc/failureFunc
   *
   * These functions are registered during a +poke and are executed
   * in the onServerEvent()/onServerError() callbacks. Only one of
   * the functions will be called, and the outstanding poke will be
   * removed after calling the success or failure function.
   */

  private outstandingPokes: Map<number, PokeHandlers> = new Map();

  /**
   * A registry of requestId to subscription functions.
   *
   * These functions are registered during a +subscribe and are
   * executed in the onServerEvent()/onServerError() callbacks. The
   * event function will be called whenever a new piece of data on this
   * subscription is available, which may be 0, 1, or many times. The
   * disconnect function may be called exactly once.
   */
  private outstandingSubscriptions: Map<number, SubscriptionRequestInterface> =
    new Map();

  /**
   * Our abort controller, used to close the connection
   */
  private abort = new AbortController();

  /**
   * Ship can be set, in which case we can do some magic stuff like send chats
   */
  ship?: string | null;

  /**
   * If verbose, logs output eagerly.
   */
  verbose?: boolean;

  /**
   * number of consecutive errors in connecting to the eventsource
   */
  private errorCount = 0;

  // @ts-expect-error
  onError?: (error: any) => void = null;
  // @ts-expect-error
  onRetry?: () => void = null;
  // @ts-expect-error
  onOpen?: () => void = null;

  /** This is basic interpolation to get the channel URL of an instantiated Urbit connection. */
  private get channelUrl(): string {
    return `${this.url}/~/channel/${this.uid}`;
  }

  private get fetchOptions(): any {
    const headers: headers = {
      'Content-Type': 'application/json',
    };
    headers.Cookie = this.cookie;
    return {
      credentials: 'include',
      accept: '*',
      headers,
      signal: this.abort.signal,
    };
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Cookie: this.cookie,
    };
  }

  /**
   * Constructs a new Urbit connection.
   *
   * @param url  The URL (with protocol and port) of the ship to be accessed. If
   * the airlock is running in a webpage served by the ship, this should just
   * be the empty string.
   * @param code The access code for the ship at that address
   */
  constructor(url: string, ship: string, cookie: string, public desk?: string) {
    super();
    this.url = url;
    this.ship = ship.replace('~', '');
    this.cookie = cookie;
    return this;
  }

  /**
   * All-in-one hook-me-up.
   *
   * Given a ship, url, and code, this returns an airlock connection
   * that is ready to go. It `|hi`s itself to create the channel,
   * then opens the channel via EventSource.
   *
   */
  // static async authenticate({
  //   ship,
  //   url,
  //   code,
  //   verbose = false,
  // }: AuthenticationInterface) {
  //   const airlock = new Urbit(`http://${url}`, code);
  //   airlock.verbose = verbose;
  //   airlock.ship = ship;
  //   // await airlock.connect();
  //   await airlock.poke({
  //     app: 'hood',
  //     mark: 'helm-hi',
  //     json: 'opening airlock',
  //   });
  //   await airlock.eventSource();
  //   return airlock;
  // }

  async open(): Promise<void> {
    // const response = await this.poke({
    //   app: 'hood',
    //   mark: 'helm-hi',
    //   json: 'opening airlock',
    // });
    // console.log(response);
    return await this.eventSource();
  }

  /**
   * Connects to the Urbit ship. Nothing can be done until this is called.
   * That's why we roll it into this.authenticate
   */
  async connect(): Promise<void> {
    if (this.verbose) {
      console.log(`password=${this.code} `, 'Connecting from node context');
    }
    return axios
      .post(`${this.url}/~/login`, {
        method: 'post',
        body: `password=${this.code}`,
        credentials: 'include',
      })
      .then((response: any) => {
        if (this.verbose) {
          console.log('Received authentication response', response);
        }
        const cookie = response.headers['set-cookie']![0];
        if (!this.ship) {
          this.ship = new RegExp(/urbauth-~([\w-]+)/).exec(cookie)![1];
        }
        this.cookie = cookie;
      })
      .catch((err) => console.log(err));
  }

  /**
   * Initializes the SSE pipe for the appropriate channel.
   */
  async eventSource(): Promise<void> {
    if (this.sseClientInitialized) {
      return Promise.resolve();
    }
    if (this.lastEventId === 0) {
      // Can't receive events until the channel is open,
      // so poke and open then
      await this.poke({
        app: 'hood',
        mark: 'helm-hi',
        json: 'Opening API channel',
      });
      return;
    }
    this.sseClientInitialized = true;
    return new Promise((resolve, reject) => {
      const sse = new EventSource(this.channelUrl, {
        headers: { Cookie: this.cookie },
      });

      sse.onopen = async (response) => {
        if (this.verbose) {
          console.log('Opened eventsource', response);
        }
        if (response.type === 'open') {
          this.errorCount = 0;
          this.onOpen && this.onOpen();
          this.emit('ready', this);
          resolve();
          return; // everything's good
        } else {
          const err = new Error('failed to open eventsource');
          reject(err);
        }
      };

      sse.onmessage = (event: any) => {
        if (this.verbose) {
          console.log('Received SSE: ', event);
        }

        const parsedEvent = JSON.parse(event.data);
        // console.log(event);
        // console.log('Received SSE: ', parsedEvent);
        if (!parsedEvent.id) return;
        this.lastEventId = parseInt(parsedEvent.id, 10);
        if (this.lastEventId - this.lastAcknowledgedEventId > 20) {
          this.ack(this.lastEventId);
        }

        if (event.data && JSON.parse(event.data)) {
          const data: any = JSON.parse(event.data);

          if (data.response === 'poke' && this.outstandingPokes.has(data.id)) {
            const funcs = this.outstandingPokes.get(data.id);
            if (data.hasOwnProperty('ok')) {
              // @ts-expect-error
              funcs.onSuccess();
            } else if (data.hasOwnProperty('err')) {
              console.error(data.err);
              // @ts-expect-error
              funcs.onError(data.err);
            } else {
              console.error('Invalid poke response', data);
            }
            this.outstandingPokes.delete(data.id);
          } else if (
            data.response === 'subscribe' &&
            this.outstandingSubscriptions.has(data.id)
          ) {
            const funcs = this.outstandingSubscriptions.get(data.id);
            if (data.hasOwnProperty('err')) {
              console.error(data.err);
              // @ts-expect-error
              funcs.err(data.err, data.id);
              this.outstandingSubscriptions.delete(data.id);
            }
          } else if (
            data.response === 'diff' &&
            this.outstandingSubscriptions.has(data.id)
          ) {
            const funcs = this.outstandingSubscriptions.get(data.id);
            try {
              // @ts-expect-error
              funcs.event(data.json);
            } catch (e) {
              console.error('Failed to call subscription event callback', e);
            }
          } else if (
            data.response === 'quit' &&
            this.outstandingSubscriptions.has(data.id)
          ) {
            const funcs = this.outstandingSubscriptions.get(data.id);
            // @ts-expect-error
            funcs.quit(data);
            this.outstandingSubscriptions.delete(data.id);
          } else {
            console.log([...this.outstandingSubscriptions.keys()]);
            console.log('Unrecognized response', data);
          }
        }
      };

      sse.onerror = (error) => {
        console.warn(error);
        if (!(error instanceof FatalError) && this.errorCount++ < 4) {
          this.onRetry && this.onRetry();
          return Math.pow(2, this.errorCount - 1) * 750;
        }
        this.onError && this.onError(error);
        throw error;
      };

      sse.addEventListener('close', () => {
        console.log('e');
        throw new Error('Ship unexpectedly closed the connection');
      });
    });
  }

  /**
   * Reset airlock, abandoning current subscriptions and wiping state
   *
   */
  reset() {
    if (this.verbose) {
      console.log('resetting');
    }
    this.delete();
    this.abort.abort();
    this.abort = new AbortController();
    this.uid = `${Math.floor(Date.now() / 1000)}-${hexString(6)}`;
    this.lastEventId = 0;
    this.lastAcknowledgedEventId = 0;
    this.outstandingSubscriptions = new Map();
    this.outstandingPokes = new Map();
    this.sseClientInitialized = false;
  }

  /**
   * Autoincrements the next event ID for the appropriate channel.
   */
  private getEventId(): number {
    this.lastEventId = Number(this.lastEventId) + 1;
    return this.lastEventId;
  }

  /**
   * Acknowledges an event.
   *
   * @param eventId The event to acknowledge.
   */
  private async ack(eventId: number): Promise<number | void> {
    this.lastAcknowledgedEventId = eventId;
    const message: Message = {
      action: 'ack',
      'event-id': eventId,
    };
    await this.sendJSONtoChannel(message);
    return eventId;
  }

  private async sendJSONtoChannel(...json: Message[]): Promise<void> {
    try {
      const response = await axios.put(this.channelUrl, json, {
        headers: this.headers,
        signal: this.abort.signal,
      });
      // console.log(response);
      if (response.statusText !== 'ok') {
        throw new Error('Failed to PUT channel');
      }
      if (!this.sseClientInitialized) {
        await this.eventSource();
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }

  /**
   * Creates a subscription, waits for a fact and then unsubscribes
   *
   * @param app Name of gall agent to subscribe to
   * @param path Path to subscribe to
   * @param timeout Optional timeout before ending subscription
   *
   * @returns The first fact on the subcription
   */
  async subscribeOnce<T = any>(app: string, path: string, timeout?: number) {
    return new Promise<T>(async (resolve, reject) => {
      let done = false;
      let id: number | null = null;
      const quit = () => {
        if (!done) {
          reject('quit');
        }
      };
      const event = (e: T) => {
        if (!done) {
          resolve(e);
          this.unsubscribe(id!);
        }
      };
      const request = { app, path, event, err: reject, quit };

      id = await this.subscribe(request);

      if (timeout) {
        setTimeout(() => {
          if (!done) {
            done = true;
            reject('timeout');
            this.unsubscribe(id!);
          }
        }, timeout);
      }
    });
  }

  /**
   * Pokes a ship with data.
   *
   * @param app The app to poke
   * @param mark The mark of the data being sent
   * @param json The data to send
   */
  async poke<T>(params: PokeInterface<T>): Promise<number> {
    const { app, mark, json, ship, onSuccess, onError } = {
      onSuccess: () => {},
      onError: () => {},
      ship: this.ship,
      ...params,
    };
    const message: Message = {
      id: this.getEventId(),
      action: 'poke',
      ship,
      app,
      mark,
      json,
    };
    const [send, result] = await Promise.all([
      this.sendJSONtoChannel(message),
      new Promise<number>((resolve, reject) => {
        this.outstandingPokes.set(message.id!, {
          onSuccess: () => {
            onSuccess();
            resolve(message.id!);
          },
          onError: (event) => {
            onError(event);
            reject(event.err);
          },
        });
      }),
    ]);
    return result;
  }

  /**
   * Subscribes to a path on an app on a ship.
   *
   *
   * @param app The app to subsribe to
   * @param path The path to which to subscribe
   * @param handlers Handlers to deal with various events of the subscription
   */
  async subscribe(params: SubscriptionRequestInterface): Promise<number> {
    const { app, path, ship, err, event, quit } = {
      err: () => {},
      event: () => {},
      quit: () => {},
      ship: this.ship,
      ...params,
    };

    const message: Message = {
      id: this.getEventId(),
      action: 'subscribe',
      ship,
      app,
      path,
    };

    this.outstandingSubscriptions.set(message.id!, {
      app,
      path,
      err,
      event,
      quit,
    });

    await this.sendJSONtoChannel(message);

    return message.id!;
  }

  /**
   * Unsubscribes to a given subscription.
   *
   * @param subscription
   */
  async unsubscribe(subscription: number) {
    return this.sendJSONtoChannel({
      id: this.getEventId(),
      action: 'unsubscribe',
      subscription,
    }).then(() => {
      this.outstandingSubscriptions.delete(subscription);
    });
  }

  /**
   * Deletes the connection to a channel.
   */
  delete() {
    // if (isBrowser) {
    //   navigator.sendBeacon(
    //     this.channelUrl,
    //     JSON.stringify([
    //       {
    //         action: 'delete',
    //       },
    //     ])
    //   );
    // } else {
    //   // TODO
    //   // this.sendMessage('delete');
    // }
  }

  /**
   * Scry into an gall agent at a path
   *
   * @typeParam T - Type of the scry result
   *
   * @remarks
   *
   * Equivalent to
   * ```hoon
   * .^(T %gx /(scot %p our)/[app]/(scot %da now)/[path]/json)
   * ```
   * The returned cage must have a conversion to JSON for the scry to succeed
   *
   * @param params The scry request
   * @returns The scry result
   */
  async scry<T = any>(params: Scry): Promise<T> {
    const { app, path, noDotJson } = params;

    let jsonType = noDotJson ? '' : '.json';
    // console.log(`${this.url}/~/scry/${app}${path}${jsonType}`);
    const response: any = await axios.get(
      `${this.url}/~/scry/${app}${path}${jsonType}`,
      this.fetchOptions
    );
    return response.data;
  }

  async viewAction<T = any>(params: Scry): Promise<T> {
    const { app, path } = params;

    const response: any = await axios.get(
      `${this.url}/~/scry/${app}${path}`,
      this.fetchOptions
    );
    return response;
  }

  async sendAction<T = any>(params: SendAction): Promise<T> {
    const { app, path, body } = params;

    const response: any = await axios.post(
      `${this.url}/${app}${path}`,
      body,
      this.fetchOptions
    );

    return response.data;
  }

  /**
   * Run a thread
   *
   *
   * @param inputMark   The mark of the data being sent
   * @param outputMark  The mark of the data being returned
   * @param threadName  The thread to run
   * @param body        The data to send to the thread
   * @returns  The return value of the thread
   */
  async thread<R, T = any>(params: Thread<T>): Promise<R> {
    const {
      inputMark,
      outputMark,
      threadName,
      body,
      desk = this.desk,
    } = params;
    if (!desk) {
      throw new Error('Must supply desk to run thread from');
    }
    const res = await axios.post(
      `${this.url}/spider/${desk}/${inputMark}/${threadName}/${outputMark}.json`,
      body,
      {
        ...this.fetchOptions,
      }
    );

    return res.data;
  }

  // /**
  //  * Utility function to connect to a ship that has its *.arvo.network domain configured.
  //  *
  //  * @param name Name of the ship e.g. zod
  //  * @param code Code to log in
  //  */
  // static async onArvoNetwork(ship: string, code: string): Promise<Urbit> {
  //   const url = `https://${ship}.arvo.network`;
  //   return await Urbit.authenticate({ ship, url, code });
  // }
}

export default Urbit;
