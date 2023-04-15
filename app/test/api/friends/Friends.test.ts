import { ships } from '../../ships';
import { APIConnection, ConduitSession } from '@holium/conduit';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { SpacesService } from '../../../src/os/services-new/ship/spaces/spaces.service';
import { ShipService } from '../../../src/os/services-new/ship/ship.service';

jest.mock('electron-log', () => {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
});

jest.mock('electron', () => {
  const originalModule = jest.requireActual('electron');

  return {
    // __esModule: true,
    ...originalModule,
    ipcMain: {
      on: jest.fn().mockReturnThis(),
      handle: jest.fn().mockReturnThis(),
    },
    BrowserWindow: {
      getAllWindows: jest.fn().mockReturnValue([]),
    },
    app: {
      getPath: jest.fn().mockImplementation(() => {
        return `/home/ajlamarc/.holium`;
      }),
    },
  };
});

jest.mock(
  'ShipService',
  () => {
    const mockGetCredentials = {
      on: jest.fn().mockReturnValue({
        code: ships.zod.code,
        url: ships.zod.url,
        // cookie: 'cookie',
      }),
    };
    return { getCredentials: mockGetCredentials };
  },
  { virtual: true }
);

describe('basic Friends tests', () => {
  let service: SpacesService;
  let connection: APIConnection;
  beforeAll(async () => {
    const session: ConduitSession = {
      url: ships.zod.url,
      ship: ships.zod.name,
      code: ships.zod.code,
      cookie: 'cookie',
    };
    connection = await APIConnection.getInstanceAsync(session);
    const shipService = new ShipService(ships.zod.name, 'foo');
    // @ts-ignore
    service = new SpacesService(undefined, shipService.shipDB.db);
  });

  test('friends demo', async () => {
    console.log(await service.getInitial());
  });

  afterAll(async () => {
    const closed = await connection.closeChannel();
    expect(closed).toBe(true);
  });
});
