import { Conduit } from '@holium/conduit';
import { Patp } from 'os/types';
import { Permissions } from '../services/tome/models/types';
import {
  desk,
  agent,
  kvMark,
  tomeMark,
} from '../services/tome/models/constants';

export const TomeApi = {
  initTome: async (
    conduit: Conduit,
    ship: Patp,
    space: string,
    app: string
  ) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: agent,
        mark: tomeMark,
        json: {
          'init-tome': {
            ship,
            space,
            app,
          },
        },
        onSuccess: (id: number) => {
          resolve(id);
        },
        onError: (e: any) => {
          reject(
            `Tome: Initializing Tome on ship ${ship} failed.  Make sure the ship and Tome agent are both running.\nError: ${e}`
          );
        },
      });
    });
  },
  initStore: async (
    conduit: Conduit,
    ship: Patp,
    space: string,
    app: string,
    bucket: string,
    permissions: Permissions
  ) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: agent,
        mark: tomeMark,
        json: {
          'init-kv': {
            ship,
            space,
            app,
            bucket,
            permissions,
          },
        },
        onSuccess: (id: number) => {
          resolve(id);
        },
        onError: (e: any) => {
          reject(
            `Tome-KV: Initializing store on ship ${ship} failed.  Make sure the ship and Tome agent are both running.\nError: ${e}`
          );
        },
      });
    });
  },
  checkBucketExistsAndCanRead: async (
    conduit: Conduit,
    ship: Patp,
    space: string,
    app: string,
    bucket: string
  ) => {
    const action = 'verify-kv';
    const body = {
      [action]: {
        ship,
        space,
        app,
        bucket,
      },
    };
    try {
      const result = await conduit.thread({
        inputMark: 'json',
        outputMark: 'json',
        threadName: 'kv-poke-tunnel',
        body: {
          ship,
          json: JSON.stringify(body),
        },
        desk,
      });
      const success = result === 'success';
      if (!success) {
        throw new Error(
          `Tome-KV: the requested bucket does not exist, or you do not have permission to access it.`
        );
      }
    } catch (e) {
      throw new Error(
        `Tome-KV: the requested bucket does not exist, or you do not have permission to access it.`
      );
    }
  },
  startWatchingForeignBucket: async (
    conduit: Conduit,
    ship: Patp,
    space: string,
    app: string,
    bucket: string
  ) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: agent,
        mark: tomeMark,
        json: {
          'watch-kv': {
            ship,
            space,
            app,
            bucket,
          },
        },
        onSuccess: (id: number) => {
          resolve(id);
        },
        onError: (e: any) => {
          reject(
            `Tome-KV: Starting watch on foreign bucket failed.  Make sure the ship and Tome agent are both running.\nError: ${e}`
          );
        },
      });
    });
  },
  getCurrentForeignBucketPermissions: async (
    conduit: Conduit,
    ship: Patp,
    space: string,
    app: string,
    bucket: string
  ) => {
    return await new Promise((resolve, reject) => {
      conduit.poke({
        app: agent,
        mark: kvMark,
        json: {
          'team-kv': {
            ship,
            space,
            app,
            bucket,
          },
        },
        onSuccess: (id: number) => {
          resolve(id);
        },
        onError: (e: any) => {
          reject(
            `Tome-KV: Starting permissions watch failed. ${ship} failed. Make sure the ship and Tome agent are both running.\nError: ${e}`
          );
        },
      });
    });
  },
};
