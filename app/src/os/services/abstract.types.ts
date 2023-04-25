type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type UpdatePayload<U> = (update: U) => void;
export type MethodProxies<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<UnwrapPromise<R>>
    : T[K] extends (callback: (...args: infer A) => void) => void
    ? (callback: (...args: A) => void) => void
    : never;
};
