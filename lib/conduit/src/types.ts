/**
 * Patp, no ~
 */
export type Patp = string;

export type Actions = 'poke' | 'subscribe' | 'diff' | 'quit';
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
  onError?: (e: any) => void;
};

export type Scry = {
  app: string; // passports
  path: string; // /<path>/members
};

export type SubscribeParams = {
  app: string; // friends
  path: string; // /all
};

export type SubscribeCallbacks = {
  onQuit?: (id: number) => void;
  onEvent?: (data: any, id?: number, mark?: string) => void;
  onError?: (e: any) => void;
};
