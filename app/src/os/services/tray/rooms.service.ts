import { ipcMain, ipcRenderer } from 'electron';
import Store from 'electron-store';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { RoomsApi } from '../../api/rooms';

import Realm from '../..';
import { BaseService } from '../base.service';
import { RoomsAppState, RoomsAppStateType, RoomsModelType } from './rooms.model';


export class RoomsService extends BaseService {
  private state?: RoomsAppStateType; // for state management
  handlers = {
    'realm.tray.rooms.join-room': this.joinRoom,
    'realm.tray.rooms.set-view': this.setView,
  };

  static preload = {
    joinRoom: (roomId: string) => {
      return ipcRenderer.invoke('realm.tray.rooms.join-room', roomId);
    },
    setView: (view: string) => {
        return ipcRenderer.invoke('realm.tray.rooms.set-view', view);
      },
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    this.state = RoomsAppState.create({
        currentView: 'list',
        selected: undefined,
        rooms: [],
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'rooms',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });

    RoomsApi.watchUpdates(this.core.conduit!, this.state!)
    RoomsApi.getPresent(this.core.conduit!)
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  joinRoom(_event: any, roomId: string) {
    // this.state?.setIsMouseInWebview(mouseInWebview);
  }
  setView(_event: any, view: string) {
    this.state?.setView(view)
}
    // this.state?.setIsMouseInWebview(mouseInWebview);
}
