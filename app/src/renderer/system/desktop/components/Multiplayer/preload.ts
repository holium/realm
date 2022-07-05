import { Presences } from './Presences';
import { api } from './multiplayer';
import { contextBridge } from 'electron';
import Mouse from '../Mouse';

contextBridge.exposeInMainWorld('realmMultiplayer', api);

export { Presences, Mouse };
