import Realm from '..';
import { EventEmitter } from 'stream';

/**
 * Base Service Interface
 *
 * @interface
 */
export class BaseService extends EventEmitter {
  core: Realm;
  options: any;
  preferences: any;
  // private state?: any;

  constructor(core: Realm, options: any = {}) {
    super();
    this.core = core;
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

export interface PreloadTypes {
  // Note the type of the static preload functions
}
