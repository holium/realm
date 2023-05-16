import { session } from 'electron';
import log from 'electron-log';
import { deSig, preSig } from '@urbit/aura';
import EventEmitter, { setMaxListeners } from 'events';
import EventSource from 'eventsource';

import { getCookie } from '../../lib/shipHelpers';
import {
  Action,
  ConduitState,
  Message,
  Patp,
  PokeCallbacks,
  PokeParams,
  ReactionPath,
  Responses,
  Scry,
  SubscribeCallbacks,
  SubscribeParams,
  Thread,
} from './types';

// For now, set it to 20
setMaxListeners(20);

/**
 * Conduit
 *
 * SSE library for interfacing with Urbit.
 */
export class Conduit extends EventEmitter {
  private url: string = '';
  private prevMsgId: number = 0;
  private lastAckId: number = 0;
  cookie: string | null = null;
  ship: string;
  pokes: Map<number, PokeParams & PokeCallbacks>;
  watches: Map<number, SubscribeParams & SubscribeCallbacks>;
  idleWatches: Map<number, SubscribeParams & SubscribeCallbacks>;
  reactions: Map<ReactionPath, (data: any, mark: string) => void>;
  reconnectTimeout: any = 0;
  status: ConduitState = ConduitState.Disconnected;
  private abort = new AbortController();
  uid: string = this.generateUID();
  private code: string | undefined = undefined;
  private sse: EventSource | undefined;

  constructor(patp: string) {
    super();
    this.ship = deSig(patp);
    this.pokes = new Map();
    this.watches = new Map();
    this.idleWatches = new Map();
    this.reactions = new Map();
    this.handleError = this.handleError.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.reconnectToChannel = this.reconnectToChannel.bind(this);
    this.startSSE = this.startSSE.bind(this);
  }

  generateUID() {
    return `${Math.floor(Date.now() / 1000)}-realm`;
  }

  updateStatus(status: ConduitState, ...args: any[]) {
    this.status = status;
    this.emit(status, ...args);
  }

  /**
   *
   * @param ship i.e. lomder-librun without the ~
   * @returns
   */
  async init(url: string, code: string, cookie: string): Promise<void> {
    this.url = url;
    this.cookie = cookie;
    this.code = code;
    this.uid = this.generateUID();
    await this.poke({
      app: 'hood',
      mark: 'helm-hi',
      json: 'Opening Realm API channel',
    });
    await this.startSSE(this.channelUrl(this.uid));
  }

  async startSSE(channelUrl: string): Promise<void> {
    if (this.status === ConduitState.Connected) {
      return Promise.resolve();
    }
    if (this.prevMsgId === 0) {
      await this.poke({
        app: 'hood',
        mark: 'helm-hi',
        json: 'Opening Realm API channel',
      });
      return;
    }
    this.updateStatus(ConduitState.Initialized);

    return new Promise((resolve, reject) => {
      this.sse = new EventSource(channelUrl, {
        headers: { Cookie: this.cookie?.split('; ')[0] },
      });

      this.sse.onopen = async (response) => {
        if (response.type === 'open') {
          this.updateStatus(ConduitState.Connected);
          resolve();
        } else {
          this.updateStatus(ConduitState.Failed);
          reject(new Error('failed to open sse'));
        }
      };

      this.sse.onmessage = async (event: MessageEvent) => {
        if (this.status !== ConduitState.Connected) {
          this.updateStatus(ConduitState.Connected);
        }
        const parsedData = JSON.parse(event.data);
        const eventId = parseInt(parsedData.id, 10);
        const type = parsedData.response as Responses;
        const lastEventId = parseInt(event.lastEventId, 10);
        if (lastEventId - this.lastAckId > 20) {
          this.ack(lastEventId);
        }
        switch (type) {
          case 'poke':
            if (this.pokes.has(eventId)) {
              const handler = this.pokes.get(eventId);
              if (parsedData.ok && handler) {
                // @ts-expect-error
                handler.onSuccess();
              } else if (parsedData.err && handler) {
                // @ts-expect-error
                handler.onError(parsedData.err);
              } else {
                console.error(new Error('poke sse error'));
              }
            }
            this.pokes.delete(eventId);
            break;
          //
          case 'subscribe':
            if (parsedData.err) {
              const watchHandler = this.watches.get(eventId);
              if (watchHandler) {
                watchHandler.onError?.(eventId, parsedData.err);
              } else {
                console.error(new Error('watch sse error'));
              }
              this.setAsIdleWatch(eventId);
            } else {
              const watchHandler = this.watches.get(eventId);
              if (watchHandler) {
                watchHandler.onSubscribed?.(eventId);
              }
            }
            break;
          //
          case 'diff':
            const json = parsedData.json;
            const mark = parsedData.mark;
            if (this.watches.has(eventId)) {
              this.watches.get(eventId)?.onEvent?.(json, eventId, mark);
            }
            const reaction = Object.keys(json)[0];
            const maybeReactionPath = `${mark}.${reaction}`;
            if (this.reactions.has(maybeReactionPath)) {
              this.reactions.get(maybeReactionPath)?.(parsedData.json, mark);
              this.reactions.delete(maybeReactionPath);
            }
            break;
          // quit
          case 'quit':
            log.info('on quit', eventId, this.watches.has(eventId));
            if (this.watches.has(eventId)) {
              const reconnectSub = this.watches.get(eventId);
              reconnectSub?.onQuit?.(parsedData);
              this.setAsIdleWatch(eventId);
              this.resubscribe(eventId);
            }
            break;
          //
          default:
            console.log('unrecognized', parsedData);
            // other
            break;
        }
      };
      this.sse.onerror = async (error) => {
        log.info(this.watches.keys());
        if (!error) {
          this.handleError({ status: 500, message: 'Unknown error' });
        }
        console.log('sse error', error);
        if (error.status === 403) {
          // @ts-ignore
          error.originator = 'sse';
          this.handleError(error);
        }
        // @ts-ignore
        if (error.status === '404') {
          return;
        }
        // @ts-expect-error
        if (error.status >= 500) {
          console.log('error', error);
          this.updateStatus(ConduitState.Failed);
          this.failGracefully();
        }
        if (!error.status) {
          // this happens when the ship is offline
          console.log('error.status', error);

          this.updateStatus(ConduitState.Failed);
          this.disconnectGracefully();
        }
      };
      this.sse.addEventListener('close', () => {
        throw new Error('Ship unexpectedly closed the connection');
      });
    });
  }

  /**
   * Refresh the underlying conduit cookie that's used for all interactions
   *   with the ship.
   * @param url ship root url (e.g. http://localhost:80)
   * @returns
   */
  async refresh(url: string, code: string): Promise<string | undefined> {
    this.url = url;
    this.code = code;
    this.updateStatus(ConduitState.Refreshing);
    const cookie: string | undefined = await Conduit.fetchCookie(url, code);
    if (cookie === undefined) {
      // console.log('Conduit.fetchCookie call failed with args => %o', {
      //   url,
      //   code,
      // });
      this.updateStatus(ConduitState.Failed);
      return undefined;
    }
    this.cookie = cookie;
    this.updateStatus(ConduitState.Refreshed, {
      url: this.url,
      ship: preSig(this.ship),
      cookie: this.cookie,
      code: this.code,
    });
    return this.cookie;
  }

  /**
   * poke
   *
   * @param params
   */
  async poke(
    params: PokeParams & PokeCallbacks
  ): Promise<number | any | undefined> {
    const handlers: PokeParams & PokeCallbacks = {
      onSuccess: (_id) => {},
      onError: (_id, _err) => {},
      ...params,
    };
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Poke,
      ship: this.ship ?? '',
      app: params.app,
      mark: params.mark,
      json: params.json,
    };
    if (params.reaction && params.onReaction) {
      this.reactions.set(params.reaction, params.onReaction);
    }
    // Properly waiting
    const [_req, res] = await Promise.all([
      this.postToChannel(message),
      new Promise((resolve, reject) => {
        this.pokes.set(message.id, {
          onSuccess: () => {
            handlers.onSuccess?.(message.id);
            resolve(message.id);
          },
          onError: (err) => {
            handlers.onError?.(message.id, err);
            reject(err);
          },
          ...params,
        });
      }),
    ]);
    return res;
  }

  /**
   * watch
   *
   * @param params the app and path to watch as well as handler functions.
   *
   * @returns whether the watch was successful
   */
  async watch(params: SubscribeParams & SubscribeCallbacks): Promise<boolean> {
    const handlers: SubscribeParams & SubscribeCallbacks = {
      onEvent: (_data) => {},
      onQuit: (_id) => {},
      onError: (_id, _err) => {},
      onSubscribed: (_id) => {},
      ...params,
    };
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Subscribe,
      ship: this.ship ?? '',
      app: params.app,
      path: params.path,
    };
    this.watches.set(message.id, handlers);
    try {
      const wasSuccessful = await this.postToChannel(message);
      if (wasSuccessful) return true;
    } catch {
      return false;
    }

    return false;
  }

  /**
   * Unsubscribe from a watch.
   *
   * @param subscription the id of the subscription to unsubscribe from
   */
  unsubscribe(subscription: number) {
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Unsubscribe,
      subscription,
    };
    this.postToChannel(message).then(() => {
      this.watches.delete(subscription);
      return message.id;
    });
  }

  /**
   * Tries to re-subscribe to a watch that has gone idle.
   *
   * @param watchId the id of the watch to re-subscribe to
   * @returns boolean indicating if the re-subscription was successful
   */
  async resubscribe(watchId: number, retryCount = 0, retryDelay = 2000) {
    const idleWatch = this.idleWatches.get(watchId);
    if (!idleWatch) {
      console.log("Watch doesn't exist, can't re-subscribe.");
      return false;
    }
    console.log('Attempting to re-subscribe to ', idleWatch?.app, '...');

    try {
      const res = await this.watch(idleWatch);
      if (res) {
        this.setAsActiveWatch(watchId);
        console.log('Re-subscribed to', idleWatch?.app);
        return true;
      }
    } catch {
      // throttle retries based on retryCount using exponential backoff
      retryDelay = Math.min(retryDelay * 2, 60000);
      console.log('resubcribing in', retryDelay / 1000, 'seconds...');
      setTimeout(() => {
        this.resubscribe(watchId, retryCount + 1, retryDelay);
      }, retryDelay);

      console.log('Failed to re-subscribe to', idleWatch?.app);
    }

    return false;
  }

  /**
   * scry
   *
   * @param params
   * @returns
   */
  async scry(params: Scry): Promise<any> {
    const { app, path } = params;
    try {
      const response = await fetch(`${this.url}/~/scry/${app}${path}.json`, {
        method: 'GET',
        headers: this.headers,
        signal: this.abort.signal,
      });
      return response.json();
    } catch (err: any) {
      log.error('scry error', app, path, err.response);
      Promise.reject(err);
    }
  }

  /**
   * thread
   *
   * @param params
   * @returns
   */
  async thread(params: Thread<Action>): Promise<any> {
    const { inputMark, outputMark, threadName, body, desk } = params;

    try {
      const response = await fetch(
        `${this.url}/spider/${desk}/${inputMark}/${threadName}/${outputMark}.json`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(body),
          signal: this.abort.signal,
        }
      );
      return response.json();
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * ack
   *
   * @param eventId
   * @returns
   */
  private async ack(eventId: number): Promise<number | void> {
    this.lastAckId = eventId;
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Ack,
      'event-id': eventId,
    };
    await this.postToChannel(message);
    return eventId;
  }

  /**************************************************************/
  /** ************************ Getters ***************************/
  /**************************************************************/
  private get headers(): { [key: string]: string } {
    if (!this.cookie) throw new Error('cookie not set');
    return {
      'Content-Type': 'application/json',
      Cookie: this.cookie.split('; ')[0],
    };
  }

  private channelUrl(uuid: string): string {
    return `${this.url}/~/channel/${uuid}`;
  }

  private get nextMsgId() {
    const next = this.prevMsgId + 1;
    this.prevMsgId = next;
    return next;
  }

  /**************************************************************/
  /** ****************** Internal functions **********************/
  /**************************************************************/

  /**
   * Sets a watch as idle.
   *
   * @param watchId the id of the active watch to set as idle
   */
  private setAsIdleWatch(watchId: number) {
    const watch = this.watches.get(watchId);
    if (watch) {
      this.watches.delete(watchId);
      this.idleWatches.set(watchId, watch);
    }
  }

  /**
   * Sets a watch as active.
   *
   * @param watchId the id of the idle watch to set as active
   */
  private setAsActiveWatch(watchId: number) {
    const watch = this.idleWatches.get(watchId);
    if (watch) {
      this.idleWatches.delete(watchId);
      this.watches.set(watchId, watch);
    }
  }

  /**
   * TODO add a limit here
   */
  async reconnectToChannel() {
    // if (this.reconnectTimeout !== 0) clearTimeout(this.reconnectTimeout);
    // this.uid = this.generateUID();
    log.info('Conduit ---> reconnecting to channel');
    const channelId = this.channelUrl(this.uid);
    await this.startSSE(channelId)
      .then(() => {
        console.log(`reconnected to channel ${channelId}`);
      })
      .catch((err) => {
        console.log('reconnectToChannel err', err);
        // (function (conduit: Conduit) {
        //   conduit.reconnectTimeout = setTimeout(() => {
        //     conduit.startSSE();
        //   }, 2000);
        // })(this);
      });
  }

  /**
   * postToChannel
   *
   * @param body
   * @returns boolean indicating if the post was successful
   */
  private async postToChannel(body: Message): Promise<boolean> {
    try {
      if (!this.headers.Cookie) throw new Error('headers.Cookie not set');

      const response = await fetch(this.channelUrl(this.uid), {
        headers: {
          ...this.headers,
          Cookie: this.headers.Cookie,
        },
        method: 'POST',
        body: body ? JSON.stringify([body]) : undefined,
        signal: this.abort.signal,
      });
      if (response) {
        if (response.status > 300 && response.status < 200) {
          return false;
        }
        if (
          this.status !== ConduitState.Connected &&
          this.status !== ConduitState.Initialized
        ) {
          this.startSSE(this.channelUrl(this.uid));
        }

        return true;
      }
    } catch (e: any) {
      const err = e;
      if (err.code === 'ECONNREFUSED') {
        // if we cannot connect to the ship, cleanup
        this.failGracefully();
      }
    }

    return false;
  }

  cleanup() {
    this.prevMsgId = 0;
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
    this.abort.abort();

    this.abort = new AbortController();
    this.sse?.close();
    this.sse = undefined;
  }

  failGracefully() {
    this.cleanup();
    this.updateStatus(ConduitState.Failed);
  }

  disconnectGracefully() {
    this.cleanup();
    this.updateStatus(ConduitState.Disconnected);
  }

  /**
   * closeChannel
   *
   * @returns boolean indicating if the close was successful
   */
  async closeChannel(): Promise<boolean> {
    const res = await this.postToChannel({
      id: this.nextMsgId,
      action: Action.Delete,
    });

    // Reset to 0
    this.prevMsgId = 0;
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
    this.abort.abort();
    this.abort = new AbortController();
    this.sse?.close();
    this.sse = undefined;
    this.updateStatus(ConduitState.Disconnected);
    return res;
  }

  /**
   * fetchCookie
   *
   * Should be used when not connected to a channel to retrieve a cookie
   *
   * @param url
   * @param code
   * @returns
   */
  static async fetchCookie(
    url: string,
    code: Patp
  ): Promise<string | undefined> {
    let cookie;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      log.error('fetchCookie timed out');
    }, 10000);

    try {
      const response = await fetch(`${url}/~/login`, {
        method: 'POST',
        body: `password=${code}`,
        headers: {
          'Content-Type': 'text/plain',
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        return Promise.reject(response);
      }
      cookie = response.headers.get('set-cookie')?.[0];
      log.info('cookie', cookie);
    } catch (err: any) {
      console.log(err);
    } finally {
      clearTimeout(timeout);
    }
    return cookie;
  }

  /**
   * Global error handler for axios errors. For now , hook 403 responses and use
   *  to indicate that cookie has expired (stale connection).
   *
   * @param err
   * @returns
   */
  async handleError(err: any): Promise<any> {
    log.info('Conduit ---> handleError', err);
    return new Promise(async (resolve, reject) => {
      if (err.status === 403 || err.response?.status === 403) {
        // if (!this.code) {
        //   console.log(
        //     'warn: http request 403 error. unable to refresh token due to missing code'
        //   );
        //   reject(err);
        //   return;
        // }
        // if (err.response) {
        //   // The request was made and the server responded with a status code
        //   // that falls out of the range of 2xx
        //   console.log(err.response.data);
        //   console.log(err.response.status);
        //   console.log(err.response.headers);
        // } else if (err.request) {
        //   // The request was made but no response was received
        //   // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        //   // http.ClientRequest in node.js
        //   console.log(err.request);
        // } else {
        //   // Something happened in setting up the request that triggered an Error
        //   console.log('Error', err.message);
        // }
        // console.log(err.config);
        console.log(
          '403 [stale connection] refreshing cookie => %o',
          this.code
        );
        let cookie: string | undefined = undefined;
        try {
          this.updateStatus(ConduitState.Refreshing);
          cookie = await getCookie({
            serverUrl: this.url,
            serverCode: this.code ?? '',
          });
          if (cookie) {
            this.cookie = cookie;
            await session
              .fromPartition(`persist:default-${this.ship}`)
              .cookies.set({
                url: `${this.url}`,
                name: `urbauth-${this.ship}`,
                value: cookie?.split('=')[1].split('; ')[0],
              });
            this.updateStatus(ConduitState.Refreshed, {
              url: this.url,
              ship: preSig(this.ship),
              cookie: this.cookie,
              code: this.code,
            });
            if (err.originator === 'sse') {
              await this.init(this.url, this.code ?? '', this.cookie);
              resolve(undefined);
              return;
            }
            err.config.headers['Cookie'] = cookie;
            // const result = await axios(err.config);
            resolve(err);
            return;
          }
          console.log('error: could not refresh token');
          this.updateStatus(ConduitState.Failed);
          reject(undefined);
          return;
        } catch (e) {
          console.log(e);
          reject(e);
          return;
        }
      }
      reject(err);
      return;
      // Promise.reject(err);
    });
  }
}
