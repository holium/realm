// Loaded in the webview/appview preload script, connects to websocket directly
// and renders cursor based on presence
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Vec2 } from '@holium/realm-multiplayer';
import { ShipModelType } from '../../../os/services/ship/models/ship';
import { rgbToString, hexToRgb } from '../../../os/lib/color';
import { AnimatedCursor } from './AnimatedCursor';

const MULTI_CLICK_ID_ATTRIB = 'data-multi-click-id';

declare global {
  interface Window {
    id: string;
  }
}

interface JoinPayload {
  event: 'join';
  id: string; // ID of the current app session
}

enum CursorEvent {
  Move = 'mousemove',
  Click = 'click',
}

interface BaseCursorPayload
  extends Pick<ShipModelType, 'color' | 'nickname' | 'patp'> {
  event: CursorEvent;
  id: string; // ID of the current app session
}

interface CursorMovePayload extends BaseCursorPayload {
  event: CursorEvent.Move;
  position: Vec2;
}

interface CursorClickPayload extends BaseCursorPayload {
  event: CursorEvent.Click;
  target: string; // some UUID on a button
}

type AnyPayload = JoinPayload | CursorMovePayload | CursorClickPayload;

interface CursorState extends Omit<CursorMovePayload, 'event' | 'id'> {
  isClicking?: boolean;
}

function getSessionID() {
  return window.multiplayer.id + window.multiplayer.ship.patp;
}

// Manage websocket connection within realm or an individual app
export const Presences = () => {
  const [cursors, setCursors] = useState<Record<string, CursorState>>({});
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:3001/ws');
    socket.current.addEventListener('open', () => {
      socket.current?.send(
        JSON.stringify({
          event: 'join',
          id: getSessionID(),
        })
      );
    });
    socket.current.addEventListener('message', (e) => {
      try {
        const payload: AnyPayload = JSON.parse(e.data);
        switch (payload.event) {
          case CursorEvent.Move: {
            // console.log(payload.position.x, payload.position.y);
            setCursors((prev) => {
              return { ...prev, [payload.id]: payload };
            });
            break;
          }
          case CursorEvent.Click: {
            const clickedElement = document.querySelector(
              `[${MULTI_CLICK_ID_ATTRIB}="${payload.target}"]`
            );
            if (!clickedElement) return;
            (clickedElement as HTMLElement).click();
            setCursors((prev) => ({
              ...prev,
              [payload.id]: {
                ...prev[payload.id],
                isClicking: true,
              },
            }));

            setTimeout(() => {
              setCursors((prev) => ({
                ...prev,
                [payload.id]: {
                  ...prev[payload.id],
                  isClicking: false,
                },
              }));
            }, 200);
          }
        }
      } catch (error) {
        console.error('Could not parse message from websockets', e, error);
      }
    });
    return () => socket.current?.close();
  }, []);

  // const onMouseMove = useCallback((e: MouseEvent) => {
  //   try {
  //     // TODO: move ship info to a presence object that isn't updated with move-cursor, reduce payload size
  //     const ship = window.multiplayer.ship;

  //     if (socket.current?.readyState !== WebSocket.OPEN || !ship) return;
  //     const payload: CursorMovePayload = {
  //       event: CursorEvent.Move,
  //       id: getSessionID(),
  //       position: { x: e.clientX, y: e.clientY },
  //       color: ship.color,
  //       nickname: ship.nickname,
  //       patp: ship.patp,
  //     };

  //     // FIXME: faking multiplayer with delay
  //     setTimeout(() => {
  //       socket.current?.send(JSON.stringify(payload));
  //     }, 1500);
  //   } catch (e) {
  //     console.error(
  //       'no ship info found in sessionStorage, not sending cursor movement',
  //       e
  //     );
  //   }
  // }, []);
  // const onClick = useCallback((e: MouseEvent) => {
  //   // prevent multiplayer clicks from creating infinite loop
  //   if (!e.isTrusted) return;
  //   try {
  //     // TODO: move ship info to a presence object that isn't updated with move-cursor, reduce payload size
  //     const ship = window.multiplayer.ship;
  //     const targetId = (e.target as HTMLElement | null)?.getAttribute(
  //       'data-multi-click-id'
  //     ); // element user clicked on
  //     console.log('target ID? ', targetId);
  //     if (socket.current?.readyState !== WebSocket.OPEN || !ship || !targetId)
  //       return;
  //     const payload: CursorClickPayload = {
  //       event: CursorEvent.Click,
  //       id: getSessionID(),
  //       target: targetId,
  //       color: ship.color,
  //       nickname: ship.nickname,
  //       patp: ship.patp,
  //     };

  //     // FIXME: faking multiplayer with delay
  //     setTimeout(() => {
  //       socket.current?.send(JSON.stringify(payload));
  //     }, 1500);
  //   } catch (e) {
  //     console.error(
  //       'no ship info found in sessionStorage, not sending cursor movement',
  //       e
  //     );
  //   }
  // }, []);

  // useEventListener('mousemove', onMouseMove);
  // useEventListener('click', onClick);

  return (
    <>
      {Object.entries(cursors).map(
        ([id, { color, nickname, patp, position, isClicking }]) => (
          <div key={id}>
            <AnimatedCursor
              color={color && rgbToString(hexToRgb(color))}
              coords={position}
              isVisible={true}
              isActive={Boolean(isClicking)}
              isActiveClickable={isClicking}
              state="pointer"
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