import Realm from '..';
import Store from 'electron-store';
import { EventEmitter } from 'stream';
import {
  getSnapshot,
  IModelType,
  IType,
  IStateTreeNode,
} from 'mobx-state-tree';

/**
 * Preference Service
 *
 */
export class PreferenceService extends EventEmitter {
  options: any;
  preferences: any;
  // private state?: any;

  constructor(options: any = {}) {
    super();
    this.options = options;
    this.preferences = {};
  }

  /**
   * Preload functions to register with the renderer
   */
  static preload = {};
}

export type PreloadTypes = {
  // Note the type of the static preload functions
};
