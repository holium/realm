// Loaded in the webview/appview preload script, connects to websocket directly
// and renders cursor based on presence
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ShipModelType } from 'renderer/logic/ship/store';
import { hexToRgb, rgbToString } from 'renderer/logic/utils/color';
import styled from 'styled-components';
import AnimatedCursor, { Vec2 } from './Cursor';
import { useEventListener } from './Cursor/useEventListener';

interface JoinPayload {
  event: 'join';
  id: string; // ID of the current app session
}

interface CursorPayload
  extends Pick<ShipModelType, 'color' | 'nickname' | 'patp'> {
  event: 'move-cursor';
  id: string; // ID of the current app session
  position: Vec2;
}

type AnyPayload = JoinPayload | CursorPayload;

const UUID = String(Date.now());

// Manage websocket connection within realm or an individual app
export const Presences = () => {
  const [cursors, setCursors] = useState<
    Record<string, Omit<CursorPayload, 'event' | 'id'>>
  >({});
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:3001/ws');
    socket.current.addEventListener('open', () => {
      socket.current?.send(
        JSON.stringify({
          event: 'join',
          id: UUID,
        })
      );
    });
    socket.current.addEventListener('message', (e) => {
      try {
        const payload: AnyPayload = JSON.parse(e.data);
        if (payload.event === 'move-cursor') {
          console.log(payload.position.x, payload.position.y);
          setCursors((prev) => {
            const { event, id, ...rest } = payload;
            return { ...prev, [payload.id]: rest };
          });
        }
      } catch (error) {
        console.error('Could not parse message from websockets', e, error);
      }
    });
    return () => socket.current?.close();
  }, []);

  const onMouseMove = useCallback((e) => {
    try {
      // TODO: move ship info to a presence object that isn't updated with move-cursor, reduce payload size
      const ship = getShip();

      if (socket.current?.readyState !== WebSocket.OPEN || !ship) return;
      const payload: CursorPayload = {
        event: 'move-cursor',
        id: UUID,
        position: { x: e.clientX, y: e.clientY },
        color: ship.color,
        nickname: ship.nickname,
        patp: ship.patp,
      };

      // FIXME: faking multiplayer with delay
      setTimeout(() => {
        socket.current?.send(JSON.stringify(payload));
      }, 1000);
    } catch (e) {
      console.error(
        'no ship info found in sessionStorage, not sending cursor movement',
        e
      );
    }
  }, []);

  useEventListener('mousemove', onMouseMove);

  return (
    <>
      {Object.entries(cursors).map(
        ([id, { color, nickname, patp, position }]) => (
          <div key={id}>
            <AnimatedCursor
              id={'test' + id}
              color={(color && rgbToString(hexToRgb(color))) || undefined}
              coords={position}
            />
            <CursorName
              style={{
                x: position.x,
                y: position.y,
                backgroundColor: color || '0,0,0',
                color: 'white',
              }}
            >
              {nickname || patp}
            </CursorName>
          </div>
        )
      )}
    </>
  );
};

const CursorName = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 6px;
  padding: 2px 4px;
  font-family: 'Rubik', sans-serif;
`;

// Gets ship info injected when webview is loaded by Realm
function getShip() {
  const shipString = window.sessionStorage.getItem('ship');
  return shipString && JSON.parse(shipString);
}
