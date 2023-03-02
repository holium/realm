import './App.css';
import { RoomsManagerProvider } from '@holium/realm-room';
import shipConfigs from 'ships.json';
import { UI } from './UI';

// NOTE: to connect one ship to another, you must manually poke the ship to `set-provider` like:
// :rooms-v2 &rooms-v2-session-action [%set-provider ~dev]
//  (^ on the dojo of ~fes if he wanted to connect to a room hosted by ~dev)

const testShip = window.location.href.split('/')[3] || '~zod';
const shipConfig = shipConfigs[testShip];

export const App = () => (
  <RoomsManagerProvider ship={shipConfig}>
    <UI />
  </RoomsManagerProvider>
);
