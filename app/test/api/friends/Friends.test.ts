import { ships } from '../../ships';
import { APIConnection, ConduitSession } from '@holium/conduit';
import { describe, test, beforeAll, afterAll } from '@jest/globals';

describe('basic Friends tests', () => {
  beforeAll(async () => {
    const session: ConduitSession = {
      url: ships.zod.url,
      ship: ships.zod.name,
      code: ships.zod.code,
      cookie: '',
    };
    const RealmAPI = APIConnection.getInstance(session);
  });

  test('friends demo', async () => {});
  afterAll(async () => {
    await RealmAPI.closeChannel();
  });
});
