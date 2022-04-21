/* eslint-disable func-names */
import { types, flow, Instance, tryReference } from 'mobx-state-tree';
import { LoaderModel } from './common/loader';

export const ContextModel = types
  .model('ContextModel', {
    url: types.string,
    patp: types.identifier,
    nickname: types.maybeNull(types.string),
    color: types.optional(types.string, '#000000'),
    avatar: types.maybeNull(types.string),
    loader: LoaderModel,
    cookie: types.maybeNull(types.string),
    loggedIn: types.optional(types.boolean, false),
  })
  .actions((self) => ({}));

// export const ContextManagar = types
//   .model('ContextManager', {
//     url: types.string,
//     patp: types.identifier,
//     nickname: types.maybeNull(types.string),
//     color: types.optional(types.string, '#000000'),
//     avatar: types.maybeNull(types.string),
//     loader: LoaderModel,
//     cookie: types.maybeNull(types.string),
//     loggedIn: types.optional(types.boolean, false),
//   })
//   .actions((self) => ({}));

// Sessions
//
