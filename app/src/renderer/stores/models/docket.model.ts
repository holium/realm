import { types } from 'mobx-state-tree';

export const AppTypes = types.enumeration(['urbit', 'web', 'native']);

export const Glob = types.model('Glob', {
  site: types.maybe(types.string),
  glob: types.maybe(
    types.model({
      base: types.string,
      'glob-reference': types.model({
        location: types.model({
          http: types.maybe(types.string),
          ames: types.maybe(types.string),
        }),
        hash: types.string,
      }),
    })
  ),
});

export const DocketApp = types.model('DocketApp', {
  title: types.string,
  info: types.string,
  color: types.string,
  type: types.optional(AppTypes, 'urbit'),
  image: types.maybeNull(types.string),
  href: Glob,
  version: types.string,
  website: types.string,
  license: types.string,
});

export const WebApp = types.model('WebApp', {
  id: types.identifier,
  title: types.string,
  color: types.string,
  info: types.maybe(types.string),
  type: types.optional(types.string, 'web'),
  icon: types.maybeNull(types.string),
  href: types.string,
});
