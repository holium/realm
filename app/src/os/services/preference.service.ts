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
 * Base Service Interface
 *
 * @interface
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
   * onEffect: sends effect data to the core process
   *
   * @param data
   */
  onEffect(data: any) {
    this.emit('on-effect', data);
  }
  // TODO explore generic state and db functions here
  // get snapshot() {
  //   return this.state ? getSnapshot(this.state) : null;
  // }

  /**
   * Preload functions to register with the renderer
   */
  static preload = {};
}

export type PreloadTypes = {
  // Note the type of the static preload functions
};
