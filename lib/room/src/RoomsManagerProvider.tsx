import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useContext,
} from 'react';
import Urbit from '@urbit/http-api';
import {
  APIHandlers,
  ProtocolConfig,
  RealmProtocol,
  RoomManagerEvent,
  RoomsManager,
} from '../src/index';
import { ShipConfig } from './types';

type RealmMultiplayerContextState = {
  ship: ShipConfig;
  roomsManager: RoomsManager | null;
};

const RealmMultiplayerContext = createContext<RealmMultiplayerContextState>(
  {} as any
);

type Props = {
  ship: ShipConfig;
  children: ReactNode;
};

export const RoomsManagerProvider = ({ ship, children }: Props) => {
  const [roomsManager, setRoomsManager] = useState<RoomsManager | null>(null);

  useEffect(() => {
    let api: Urbit | null = null;

    Urbit.authenticate(ship).then(async (newApi) => {
      api = newApi;
      await newApi.connect();
      const handlers: APIHandlers = {
        poke: newApi.poke.bind(newApi),
        scry: newApi.scry.bind(newApi),
      };
      const protocolConfig: ProtocolConfig = {
        rtc: {
          iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
        },
      };

      const protocol = new RealmProtocol(
        `~${ship.ship}`,
        protocolConfig,
        handlers
      );
      const newroomsManager = new RoomsManager(protocol);
      setRoomsManager(newroomsManager);
      newApi.subscribe({
        app: 'rooms-v2',
        path: '/lib',
        event: (data: any, mark: any) => {
          (newroomsManager.protocol as RealmProtocol).onSignal(data, mark);
        },
      });
      newroomsManager.on(
        RoomManagerEvent.OnDataChannel,
        (_rid: string, _peer: string, data: any) => {
          console.log('peer data', data);
        }
      );
    });

    return () => {
      api?.delete();
    };
  }, []);

  return (
    <RealmMultiplayerContext.Provider value={{ ship, roomsManager }}>
      {children}
    </RealmMultiplayerContext.Provider>
  );
};

export const useRoomsManager = () => useContext(RealmMultiplayerContext);
