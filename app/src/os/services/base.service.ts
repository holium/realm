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

  constructor(core: Realm, options: any = {}) {
    super();
    this.core = core;
    this.options = options;
  }

  /**
   * onEffect: sends effect data to the core process
   *
   * @param data
   */
  onEffect(data: any) {
    this.emit('on-effect', data);
  }

  /**
   * Preload functions to register with the renderer
   */
  static preload = {};
}

export type PreloadTypes = {
  // Note the type of the static preload functions
};
