import './App.css';
import * as process from 'process';
import { RoomsManagerProvider } from '@holium/realm-room';
import { getShipConfig } from './shipData';
import { UI } from './UI';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

// NOTE: to connect one ship to another, you must manually poke the ship to `set-provider` like:
// :rooms-v2 &rooms-v2-session-action [%set-provider ~dev]
//  (^ on the dojo of ~fes if he wanted to connect to a room hosted by ~dev)

const testShip = window.location.href.split('/')[3] || '~zod';
const shipConfig = getShipConfig(testShip);

export const App = () => (
  <RoomsManagerProvider ship={shipConfig}>
    <UI />
  </RoomsManagerProvider>
);
