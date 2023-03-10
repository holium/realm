import { Conduit } from '@holium/conduit';

export const ComposerApi = {
  addSpace: async (conduit: Conduit, spacePath: string) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'add-space': {
          'space-path': spacePath,
        },
      },
    };
    return conduit.poke(payload);
  },
  removeSpace: async (conduit: Conduit, spacePath: string) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'remove-space': {
          'space-path': spacePath,
        },
      },
    };
    return conduit.poke(payload);
  },
  addStack: async (conduit: Conduit, spacePath: string, stack: any) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'add-stack': {
          'space-path': spacePath,
          stack,
        },
      },
    };
    return conduit.poke(payload);
  },
  removeStack: async (conduit: Conduit, spacePath: string, stackId: string) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'remove-stack': {
          'space-path': spacePath,
          'stack-id': stackId,
        },
      },
    };
    return conduit.poke(payload);
  },
  setCurrentStack: async (
    conduit: Conduit,
    spacePath: string,
    stackId: string
  ) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'set-current-stack': {
          'space-path': spacePath,
          'stack-id': stackId,
        },
      },
    };
    return conduit.poke(payload);
  },
  addWindow: async (
    conduit: Conduit,
    spacePath: string,
    stackId: string,
    window: any
  ) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'add-window': {
          'space-path': spacePath,
          'stack-id': stackId,
          window,
        },
      },
    };
    return conduit.poke(payload);
  },
  removeWindow: async (
    conduit: Conduit,
    spacePath: string,
    stackId: string,
    windowId: string
  ) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'remove-window': {
          'space-path': spacePath,
          'stack-id': stackId,
          'window-id': windowId,
        },
      },
    };
    return conduit.poke(payload);
  },
  getAll: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'composer',
      path: `/all`,
    });
  },
};
