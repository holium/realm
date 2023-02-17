import { useState, useEffect, useCallback } from 'react';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { hexToRgb, rgbToString } from 'os/lib/color';
import { AnimatedCursor, MouseState } from './AnimatedCursor';
import { Position } from 'os/types';
import {
  CursorEvent,
  CursorPayload,
  useRealmMultiplayer,
} from '@holium/realm-multiplayer';
import {
  DataPacket_Kind,
  RealmProtocol,
  RoomManagerEvent,
  RoomsManager,
} from '@holium/realm-room';
import Urbit from '@urbit/http-api';

type ShipConfig = {
  ship: string;
  url: string;
  code: string;
};

const shipConfigs: Record<string, ShipConfig> = {
  '~zod': {
    ship: 'zod',
    url: 'http://localhost',
    code: 'lidlut-tabwed-pillex-ridrup',
  },
  '~bus': {
    ship: 'bus',
    url: 'http://localhost:8080',
    code: 'riddec-bicrym-ridlev-pocsef',
  },
};

let roomsManager: RoomsManager | null = null;

export const Mouse = () => {
  const { ship } = useRealmMultiplayer();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<MouseState>('pointer');
  const [mouseColor, setMouseColor] = useState('0, 0, 0');
  const active = useToggle(false);
  const visible = useToggle(false);
  const mouseLayerTracking = useToggle(false);
  const [roomsApi, setRoomsManager] = useState<RoomsManager | null>(null);

  const updateMousePosition = useCallback((newPosition: Position) => {
    // Update the coordinates locally.
    setPosition(newPosition);
    // Signal to the rest of the network.
    const cursorPayload: CursorPayload = {
      id: ship.patp,
      event: CursorEvent.Move,
      position: newPosition,
    };

    roomsManager?.sendData({
      kind: DataPacket_Kind.DATA,
      value: { cursor: cursorPayload },
    });
  }, []);

  useEffect(() => {
    let api: any = null;
    if (!roomsApi) {
      Urbit.authenticate(shipConfigs[ship.patp]).then(async (newApi) => {
        api = newApi;
        await api.connect();
        const handlers = {
          poke: api.poke.bind(api),
          scry: api.scry.bind(api),
        };

        const protocol = new RealmProtocol(
          ship.patp,
          {
            rtc: {
              iceServers: [{ urls: ['stun:coturn.holium.live:3478'] }],
            },
          },
          handlers
        );
        roomsManager = new RoomsManager(protocol);
        const rid = roomsManager.createRoom('test', 'public', 'test');
        roomsManager.enterRoom(rid);
        setRoomsManager(roomsManager);
        api.subscribe({
          app: 'rooms-v2',
          path: '/lib',
          event: (data: any, mark: any) => {
            console.log('lib', data);
            (roomsManager?.protocol as RealmProtocol).onSignal(data, mark);
          },
        });
        roomsManager.on(
          RoomManagerEvent.OnDataChannel,
          (_rid: string, _peer: string, data: any) => {
            console.log('peer data', data);
          }
        );
      });
    }

    return () => {
      api?.delete();
    };
  }, [roomsApi === null]);

  useEffect(() => {
    window.electron.app.onMouseOver(visible.toggleOn);
    window.electron.app.onMouseOut(visible.toggleOff);
    window.electron.app.onMouseMove((newCoordinates, newState, isDragging) => {
      // We only use the IPC'd coordinates if
      // A) mouse layer tracking is disabled, or
      // B) the mouse is dragging, since the mouse layer doesn't capture movement on click.
      if (!mouseLayerTracking.isOn) {
        setPosition(newCoordinates);
      } else if (isDragging) {
        updateMousePosition(newCoordinates);
      }
      setState(newState);
    });

    window.electron.app.onMouseColorChange((hex) => {
      const rgbString = rgbToString(hexToRgb(hex));
      if (rgbString) setMouseColor(rgbString);
    });

    window.electron.app.onMouseDown(active.toggleOn);
    window.electron.app.onMouseUp(active.toggleOff);

    const handleMouseMove = (e: MouseEvent) => {
      if (!active.isOn) updateMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.electron.app.onEnableMouseLayerTracking(() => {
      mouseLayerTracking.toggleOn();
      window.addEventListener('mousemove', handleMouseMove);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <AnimatedCursor
      state={state}
      coords={position}
      isActive={active.isOn}
      isVisible={visible.isOn}
      color={mouseColor}
    />
  );
};
