import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useContext,
} from 'react';
import Urbit from '@urbit/http-api';
import { APIHandlers, RealmProtocol, RoomsManager } from '../src/index';
import { ShipConfig } from './types';
import { ProtocolConfig } from './connection/BaseProtocol';

type RealmMultiplayerContextState = {
  ship: ShipConfig;
  roomsManager: RoomsManager | null;
};

const RealmMultiplayerContext = createContext<RealmMultiplayerContextState>(
  {} as any
);

type Props = {
  ship: ShipConfig;
  protocolConfig: ProtocolConfig;
  rid?: string;
  children: ReactNode;
};

export const RoomsManagerProvider = ({
  ship,
  protocolConfig,
  rid,
  children,
}: Props) => {
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
