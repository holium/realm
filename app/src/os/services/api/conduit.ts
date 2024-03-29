import log from 'electron-log';
import { deSig, preSig } from '@urbit/aura';
import EventEmitter, { setMaxListeners } from 'events';
import EventSource from 'eventsource';

import { getCookie, setSessionCookie } from '../../lib/shipHelpers';
import {
  Action,
  ConduitState,
  Message,
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
  private url = '';
  /**
   * lastEventId is an auto-updated index of which events have been *sent* over this channel.
   * lastHeardEventId is the latest event we have heard back about.
   * lastAcknowledgedEventId is the latest event we have sent an ack for.
   */
  private lastEventId = 0;
  private lastHeardEventId = -1;
  private lastAcknowledgedEventId = -1;
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
   * refreshCookie - centralized location for refreshing the conduit cookie. ensures
   *   errors are handled and events are emitted.
   *
   */
  async refreshCookie() {
    if (!this.code) throw new Error('fetchCookie failed, no code');
    this.cookie = await getCookie({
      serverUrl: this.url,
      serverCode: this.code,
    });
    if (!this.cookie) {
      throw new Error('fetchCookie failed');
    }
    this.updateStatus(ConduitState.Refreshed, {
      url: this.url,
      code: this.code,
      cookie: this.cookie,
    });
  }

  /**
   * safeFetch - wrap the base fetch with an auto-retry attempt on 403 error
   *
   * @param url
   * @param options
   */
  async safeFetch(url: string, options: any): Promise<any> {
    try {
      let response = await fetch(url, { ...options, headers: this.headers });
      if (response.status === 403) {
        await this.refreshCookie();
        response = await fetch(url, { ...options, headers: this.headers });
      }
      return response;
    } catch (err: any) {
      Promise.reject(err);
    }
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
    // before doing anything, determine if the cookie is stale .. this can happen if a cookie from a
    //  prior session (logging out) has become stale and this call is made when the app restarts. chose
    //  to put this here to prevent potential fetchCookie eyre thrashing by checking 403 errors in the scry
    //  and other eyre methods. potentially lots of these methods can be called at startup; therefore a refresh
    //  here will eliminate multiple fetchCookie calls
    //   use the current space scry to test cookie
    // http://localhost/~/scry/spaces/current.json
    //  the scry below will set the this.cookie internally and becomes the new value for all future calls
    try {
      await this.scry({ app: 'spaces', path: `/current` });
    } catch (e) {
      log.error(e);
    }
    await this.poke({
      app: 'hood',
      mark: 'helm-hi',
      json: 'Opening Realm API channel',
    });
  }

  async startSSE(channelUrl: string): Promise<void> {
    log.info('starting SSE');
    if (this.status === ConduitState.Connected) {
      return Promise.resolve();
    }
    if (this.lastEventId === 0) {
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
        headers: { Cookie: this.cookie },
      });

      this.sse.onopen = (response) => {
        if (response.type === 'open') {
          this.updateStatus(ConduitState.Connected);
          setInterval(() => {
            if (this.sse?.readyState === EventSource.CLOSED) {
              log.warn('sse closed!');
            }
          }, 1000);
          resolve();
          return;
        } else {
          this.updateStatus(ConduitState.Failed);
          reject(new Error('failed to open sse'));
        }
      };

      this.sse.onmessage = async (event: MessageEvent) => {
        if (this.status !== ConduitState.Connected) {
          this.updateStatus(ConduitState.Connected);
        }
        if (!event.lastEventId) return;

        const lastEventId = parseInt(event.lastEventId, 10);
        if (lastEventId <= this.lastHeardEventId) {
          log.warn('dropping old or out-of-order event', {
            lastEventId,
            lastHeard: this.lastHeardEventId,
          });
          return;
        }
        this.lastHeardEventId = lastEventId;

        if (lastEventId - this.lastAcknowledgedEventId > 20) {
          this.ack(lastEventId);
        }
        const parsedEvent = JSON.parse(event.data);
        const eventId = parsedEvent.id;
        const type = parsedEvent.response as Responses;

        switch (type) {
          case 'poke':
            if (this.pokes.has(eventId)) {
              const handler = this.pokes.get(eventId);
              if (parsedEvent.ok && handler) {
                // @ts-expect-error
                handler.onSuccess();
              } else if (parsedEvent.err && handler) {
                // @ts-expect-error
                handler.onError(parsedEvent.err);
              } else {
                log.error('poke sse error', parsedEvent.err);
              }
            }
            this.pokes.delete(eventId);
            break;
          //
          case 'subscribe':
            if (parsedEvent.err) {
              const watchHandler = this.watches.get(eventId);
              if (watchHandler) {
                watchHandler.onError?.(eventId, parsedEvent.err);
              } else {
                log.error('watch sse error', parsedEvent.err);
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
          case 'diff': {
            // log.info('diff event', parsedEvent);
            const json = parsedEvent.json;
            const mark = parsedEvent.mark;
            if (this.watches.has(eventId)) {
              this.watches.get(eventId)?.onEvent?.(json, eventId, mark);
            }
            const reaction = Object.keys(json)[0];
            const maybeReactionPath = `${mark}.${reaction}`;
            if (this.reactions.has(maybeReactionPath)) {
              this.reactions.get(maybeReactionPath)?.(parsedEvent.json, mark);
              this.reactions.delete(maybeReactionPath);
            }
            break;
          }
          // quit
          case 'quit':
            log.info('on quit called');
            if (this.watches.has(eventId)) {
              log.info('on quit', eventId, this.watches.has(eventId));
              const reconnectSub = this.watches.get(eventId);
              this.setAsIdleWatch(eventId);
              if (reconnectSub?.onQuit) {
                reconnectSub?.onQuit?.(parsedEvent);
              } else {
                try {
                  await this.resubscribe(eventId);
                } catch (e) {
                  console.error(e);
                }
              }
            }
            break;
          //
          default:
            log.info('unrecognized', parsedEvent);
            break;
        }
      };
      this.sse.onerror = async (error) => {
        log.info(this.watches.keys());
        if (!error) {
          try {
            await this.handleError({ status: 500, message: 'Unknown error' });
          } catch (e) {
            console.error(e);
          }
        }
        log.error('sse error', error);
        if (error.status === 403) {
          // @ts-ignore
          error.originator = 'sse';
          try {
            await this.handleError(error);
          } catch (e) {
            console.error(e);
          }
        }
        // @ts-ignore
        if (error.status === '404') {
          return;
        }
        // @ts-expect-error
        if (error.status >= 500) {
          log.error('error.status >= 500', error);
          this.updateStatus(ConduitState.Failed);
          this.failGracefully();
        }
        if (!error.status) {
          // this happens when the ship is offline
          log.error('!error.status', error);

          this.updateStatus(ConduitState.Failed);
          this.disconnectGracefully();
        }
      };
      this.sse.addEventListener('close', () => {
        log.warn('Ship unexpectedly closed the connection');
      });
    });
  }

  /**
   * Autoincrements the next event ID for the appropriate channel.
   */
  private getEventId(): number {
    this.lastEventId += 1;
    return this.lastEventId;
  }

  /**
   * Refresh the underlying conduit cookie that's used for all interactions
   *   with the ship.
   * @param url ship root url (e.g. http://localhost:80)
   * @returns
   */
  async refresh(url: string, code: string): Promise<string | null> {
    this.url = url;
    this.code = code;
    this.updateStatus(ConduitState.Refreshing);
    const cookie: string | null = await getCookie({
      serverUrl: url,
      serverCode: code,
    });
    if (cookie === null) {
      this.updateStatus(ConduitState.Failed);
      return null;
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

    if (this.lastEventId === 0) {
      log.info('poke: opening conduit');
    }

    const message: Message = {
      id: this.getEventId(),
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      onError: (_id, _err) => {},
      onSubscribed: (_id) => {},
      ...params,
    };

    if (this.lastEventId === 0) {
      log.info('watch: opening conduit');
    }

    const message: Message = {
      id: this.getEventId(),
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
      id: this.getEventId(),
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
   * This is called automatically when onQuit is not defined for a watch.
   * To skip auto-resubscribing, define an onQuit handler that does nothing.
   *
   * @param watchId the id of the watch to re-subscribe to
   * @returns boolean indicating if the re-subscription was successful
   */
  async resubscribe(watchId: number, retryCount = 0, retryDelay = 2000) {
    log.info('resubscribing to watch', watchId);
    const idleWatch = this.idleWatches.get(watchId);
    if (!idleWatch) {
      log.info("Watch doesn't exist, can't re-subscribe.");
      return false;
    }
    log.info('Attempting to re-subscribe to ', idleWatch?.app, '...');

    try {
      const res = await this.watch(idleWatch);
      if (res) {
        this.setAsActiveWatch(watchId);
        log.info('Re-subscribed to', idleWatch?.app);
        return true;
      }
    } catch {
      // throttle retries based on retryCount using exponential backoff
      retryDelay = Math.min(retryDelay * 2, 60000);
      log.info('resubcribing in', retryDelay / 1000, 'seconds...');
      setTimeout(() => {
        this.resubscribe(watchId, retryCount + 1, retryDelay);
      }, retryDelay);
      log.warn('Failed to re-subscribe to', idleWatch?.app);
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
      const url = `${this.url}/~/scry/${app}${path}.json`;
      const response = await this.safeFetch(url, {
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
  async thread(params: Thread): Promise<any> {
    const { inputMark, outputMark, threadName, body, desk } = params;

    try {
      const response = await this.safeFetch(
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
      log.error(err);
    }
  }

  /**
   * ack
   *
   * @param eventId
   * @returns
   */
  private async ack(eventId: number): Promise<number | void> {
    this.lastAcknowledgedEventId = eventId;
    const message: Message = {
      // id: this.getEventId(),
      action: Action.Ack,
      'event-id': eventId,
    };
    try {
      await this.postToChannel(message);
    } catch (e) {
      console.error(e);
    }
    return eventId;
  }

  /**
   * Deletes the connection to a channel.
   */
  async delete() {
    const body = JSON.stringify([
      {
        id: this.getEventId(),
        action: 'delete',
      },
    ]);
    try {
      const response = await fetch(this.channelUrl(this.uid), {
        headers: {
          ...this.headers,
          Cookie: this.headers.Cookie,
        },
        method: 'POST',
        body: body,
        signal: this.abort.signal,
      });
      if (!response.ok) {
        console.error('Failed to DELETE channel in node context');
      }
    } catch (e) {
      console.error(e);
    }
    return;
  }

  /**************************************************************/
  /** ************************ Getters ***************************/
  /**************************************************************/
  private get headers(): { [key: string]: string } {
    if (!this.cookie) throw new Error('cookie not set');
    return {
      'Content-Type': 'application/json',
      Cookie: this.cookie,
    };
  }

  private channelUrl(uuid: string): string {
    return `${this.url}/~/channel/${uuid}`;
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
   * postToChannel
   *
   * @param body
   * @returns boolean indicating if the post was successful
   */
  private async postToChannel(body: Message): Promise<boolean> {
    try {
      if (!this.headers.Cookie) throw new Error('headers.Cookie not set');

      const response = await this.safeFetch(this.channelUrl(this.uid), {
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
          body.action !== Action.Delete &&
          this.status !== ConduitState.Connected &&
          this.status !== ConduitState.Initialized
        ) {
          // you must await here for SSE to complete; otherwise init calls in other
          //  locations of the conduit can create 2nd connections
          await this.startSSE(this.channelUrl(this.uid));
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
    this.lastEventId = 0;
    this.lastHeardEventId = -1;
    this.lastAcknowledgedEventId = -1;
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
  async closeChannel() {
    await this.delete();
    // Reset to 0
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
    this.abort.abort();
    this.abort = new AbortController();

    this.sse?.close();
    this.sse = undefined;
    this.lastEventId = 0;
    this.lastHeardEventId = -1;
    this.lastAcknowledgedEventId = -1;
    this.updateStatus(ConduitState.Disconnected);
  }

  static async reconnect(conduit: Conduit) {
    await conduit.closeChannel();
    if (!conduit.url || !conduit.code || !conduit.cookie)
      throw new Error('url, code, or cookie not set');
    await conduit.init(conduit.url, conduit.code, conduit.cookie);
    return conduit;
  }

  /**
   * Global error handler for axios errors. For now , hook 403 responses and use
   *  to indicate that cookie has expired (stale connection).
   *
   * @param err
   * @returns
   */
  async handleError(err: any): Promise<any> {
    // eslint-disable-next-line no-async-promise-executor
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
        log.info('403 [stale connection] refreshing cookie => %o', this.code);
        let cookie: string | null = null;
        try {
          this.updateStatus(ConduitState.Refreshing);
          if (!this.code) throw new Error('fetchCookie failed, no code');
          cookie = await getCookie({
            serverUrl: this.url,
            serverCode: this.code,
          });
          if (cookie) {
            this.cookie = cookie;
            await setSessionCookie({
              ship: preSig(this.ship),
              url: this.url,
              code: this.code,
              cookie: this.cookie,
            });
            // await session
            //   .fromPartition(`persist:default-${this.ship}`)
            //   .cookies.set({
            //     url: `${this.url}`,
            //     name: `urbauth-${this.ship}`,
            //     value: cookie?.split('=')[1].split('; ')[0],
            //   });
            this.updateStatus(ConduitState.Refreshed, {
              url: this.url,
              ship: preSig(this.ship),
              cookie: this.cookie,
              code: this.code,
            });
            if (err.originator === 'sse') {
              await this.init(this.url, this.code ?? '', this.cookie);
              resolve(null);
              return;
            }
            err.config.headers['Cookie'] = cookie;
            return resolve(err);
          }
          log.error('error: could not refresh token');
          this.updateStatus(ConduitState.Failed);
          return reject(null);
        } catch (e) {
          log.error(e);
          return reject(e);
        }
      }
      return reject(err);
    });
  }
}
