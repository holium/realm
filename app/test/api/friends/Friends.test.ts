import { ships } from '../../ships';
import { APIConnection, ConduitSession } from '@holium/conduit';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { SpacesService } from '../../../src/os/services-new/ship/spaces/spaces.service';

describe('basic Friends tests', () => {
  let service: SpacesService;
  let connection: APIConnection;
  beforeAll(async () => {
    const session: ConduitSession = {
      url: ships.zod.url,
      ship: ships.zod.name,
      code: ships.zod.code,
    };
    connection = APIConnection.getInstance(session);
    service = new SpacesService();
  });

  test('friends demo', async () => {
    console.log(service.getInitial());
  });

  afterAll(async () => {
    const closed = await connection.closeChannel();
    expect(closed).toBe(true);
  });
});
