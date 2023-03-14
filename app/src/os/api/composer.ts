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
    conduit.poke(payload);
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
    conduit.poke(payload);
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
    conduit.poke(payload);
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
    conduit.poke(payload);
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
    conduit.poke(payload);
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
    conduit.poke(payload);
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
    conduit.poke(payload);
  },
  setWindowBounds: (
    conduit: Conduit,
    spacePath: string,
    stackId: string,
    windowId: string,
    bounds: any
  ) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'set-window-bounds': {
          'space-path': spacePath,
          'stack-id': stackId,
          'window-id': windowId,
          bounds,
        },
      },
    };
    conduit.poke(payload);
  },
  setWindowLayer: (
    conduit: Conduit,
    spacePath: string,
    stackId: string,
    windowId: string,
    zIndex: number
  ) => {
    const payload = {
      app: 'composer',
      mark: 'composer-action',
      json: {
        'set-window-layer': {
          'space-path': spacePath,
          'stack-id': stackId,
          'window-id': windowId,
          'z-index': zIndex,
        },
      },
    };
    conduit.poke(payload);
  },
  getAll: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'composer',
      path: `/all`,
    });
  },
};
