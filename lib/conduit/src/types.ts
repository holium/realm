/**
 * Patp, no ~
 */
export type Patp = string;

export enum ConduitState {
  Connecting = 'connecting',
  Initialized = 'initialized',
  Connected = 'connected',
  Disconnected = 'offline',
  Failed = 'failed',
  NoInternet = 'no-internet',
  Stale = 'stale',
  Refreshing = 'refreshing',
  Refreshed = 'refreshed',
}

export type Actions =
  | 'poke'
  | 'subscribe'
  | 'diff'
  | 'quit'
  | 'unsubscribe'
  | 'delete';

export enum Action {
  Poke = 'poke',
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
  Ack = 'ack',
  Delete = 'delete',
}

export type Responses = 'poke' | 'subscribe' | 'diff' | 'quit';

export type ReactionPath = string; // visa-reaction.invited

export type PokeParams = {
  ship?: string; // lomder-librun
  app: string; // passports
  mark: string; // visa-action
  json: any; // { "data": "something" }
  reaction?: ReactionPath; // visa-reaction.invited
};

export type PokeCallbacks = {
  onSuccess?: (id: number) => void;
  onReaction?: (data: any, mark?: string) => void;
  onError?: (id: number, e: any) => void;
};

export type Scry = {
  app: string; // passports
  path: string; // /<path>/members
};

export type SubscribeParams = {
  ship?: string; // lomder-librun
  app: string; // friends
  path: string; // /all
};

export type SubscribeCallbacks = {
  onQuit?: (id: number) => void;
  onEvent?: (data: any, id?: number, mark?: string) => void;
  onError?: (id: number, e: any) => void;
  onSubscribed?: (subscription: number) => void;
};

export type AckParams = {
  action: Action.Ack;
  'event-id': number;
};

export type UnsubscribeParams = {
  action: Action.Unsubscribe;
  subscription: number;
};

export type DeleteParams = {
  action: Action.Delete;
};

export type MessageBase = { id: number };

export type Message =
  | (MessageBase & PokeParams & { action: Action.Poke })
  | (MessageBase & SubscribeParams & { action: Action.Subscribe })
  | (MessageBase & UnsubscribeParams)
  | (MessageBase & AckParams)
  | (MessageBase & DeleteParams);

export interface Thread<Action> {
  inputMark: string; // graph-update
  outputMark: string; //
  threadName: string; // graph-add-nodes
  desk?: string; // graph-store
  body: Action;
}
