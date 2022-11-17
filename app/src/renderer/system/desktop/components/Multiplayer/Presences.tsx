// Loaded in the webview/appview preload script, connects to websocket directly
// and renders cursor based on presence
// import { Ship } from '../../../../../../../playground/src/lib/realm-multiplayer/hooks';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { hexToRgb, rgbToString } from 'os/lib/color';
import styled from 'styled-components';
import AnimatedCursor from '../Cursor';
import { useEventListener } from '../Cursor/useEventListener';
import { subscribe, close, send, SendPartial } from './multiplayer';
import {
  CursorMovePayload,
  CursorEvent,
  CursorClickPayload,
  CursorLeavePayload,
  PresenceStatePayload,
  RealmEvent,
  CursorOverPayload,
  CursorDownPayload,
  CursorUpPayload,
  CursorOutPayload,
  PresenceStateSyncPayload,
  Ship,
} from '@holium/realm-multiplayer';
// import { Ship } from '@holium/realm-multiplayer/hooks';

const MULTI_CLICK_ID_ATTRIB = 'data-multi-click-id';

interface CursorState extends Omit<CursorMovePayload, 'event' | 'id'> {
  isClicking?: boolean;
}

// Manage websocket connection within realm or an individual app
export function Presences() {
  const [cursors, setCursors] = useState<Record<string, CursorState>>({});
  const [ships, setShips] = useState<Record<string, Ship>>({});

  // Update cursors for other cursors
  useEffect(() => {
    subscribe<CursorMovePayload>(CursorEvent.Move, (payload) => {
      setCursors((prev) => {
        const { event, id, ...rest } = payload;
        return { ...prev, [payload.id]: rest };
      });
    });

    subscribe<CursorClickPayload>(CursorEvent.Click, (payload) => {
      // Add clicking state to render cursor click state
      setCursors((prev) => ({
        ...prev,
        [payload.id]: {
          ...prev[payload.id],
          isClicking: true,
        },
      }));

      // show click state for 200ms
      setTimeout(() => {
        setCursors((prev) => ({
          ...prev,
          [payload.id]: {
            ...prev[payload.id],
            isClicking: false,
          },
        }));
      }, 200);
    });

    subscribe<CursorLeavePayload>(CursorEvent.Leave, (payload) => {
      setCursors((prev) => {
        const { [payload.id]: _, ...rest } = prev;
        return rest;
      });
    });

    subscribe<PresenceStatePayload>(
      RealmEvent.UpdatePresenceState,
      (payload) => {
        if (payload.key === 'ship') {
          setShips((prev) => ({
            ...prev,
            [payload.id]: payload.value as Ship,
          }));
        }
      }
    );

    subscribe<PresenceStateSyncPayload>(
      RealmEvent.SyncPresenceState,
      (payload) => {
        if (payload.states.hasOwnProperty('ship')) {
          setShips(payload.states.ship);
        }
      }
    );

    return () => close();
  }, []);

  // Send information about current user cursor
  const onMouseMove = useCallback((e: MouseEvent) => {
    const payload: SendPartial<CursorMovePayload> = {
      event: CursorEvent.Move,
      position: { x: e.pageX, y: e.pageY },
    };

    send(payload);
  }, []);

  const onClick = useCallback((e: MouseEvent) => {
    // prevent multiplayer clicks from creating infinite loop
    if (!e.isTrusted) return;
    const targetId = (e.target as HTMLElement | null)?.getAttribute(
      MULTI_CLICK_ID_ATTRIB
    ); // element user clicked on
    if (!targetId) return;
    const payload: SendPartial<CursorClickPayload> = {
      event: CursorEvent.Click,
      target: targetId,
    };

    send(payload);
  }, []);

  const onMouseOver = useCallback((e: MouseEvent) => {
    // prevent multiplayer clicks from creating infinite loop
    if (!e.isTrusted) return;
    const targetId = (e.target as HTMLElement | null)?.getAttribute(
      MULTI_CLICK_ID_ATTRIB
    ); // element user clicked on
    if (!targetId) return;
    const payload: SendPartial<CursorOverPayload> = {
      event: CursorEvent.Over,
      target: targetId,
    };

    send(payload);
  }, []);

  const onMouseDown = useCallback((e: MouseEvent) => {
    // prevent multiplayer clicks from creating infinite loop
    if (!e.isTrusted) return;
    const targetId = (e.target as HTMLElement | null)?.getAttribute(
      MULTI_CLICK_ID_ATTRIB
    ); // element user clicked on
    if (!targetId) return;
    const payload: SendPartial<CursorDownPayload> = {
      event: CursorEvent.Down,
      target: targetId,
    };

    send(payload);
  }, []);

  const onMouseUp = useCallback((e: MouseEvent) => {
    // prevent multiplayer clicks from creating infinite loop
    if (!e.isTrusted) return;
    const targetId = (e.target as HTMLElement | null)?.getAttribute(
      MULTI_CLICK_ID_ATTRIB
    ); // element user clicked on
    if (!targetId) return;
    const payload: SendPartial<CursorUpPayload> = {
      event: CursorEvent.Up,
      target: targetId,
    };

    send(payload);
  }, []);

  const onMouseOut = useCallback((e: MouseEvent) => {
    // prevent multiplayer clicks from creating infinite loop
    if (!e.isTrusted) return;
    const targetId = (e.target as HTMLElement | null)?.getAttribute(
      MULTI_CLICK_ID_ATTRIB
    ); // element user clicked on
    if (!targetId) return;
    const payload: SendPartial<CursorOutPayload> = {
      event: CursorEvent.Out,
      target: targetId,
    };

    send(payload);
  }, []);

  const onMouseLeave = useCallback(() => {
    const payload: SendPartial<CursorLeavePayload> = {
      event: CursorEvent.Leave,
    };

    send(payload);
  }, []);

  useEventListener('mousemove', onMouseMove);
  useEventListener('mouseleave', onMouseLeave, document);
  useEventListener('blur', onMouseLeave);
  useEventListener('click', onClick);
  useEventListener('mouseover', onMouseOver);
  useEventListener('mousedown', onMouseDown);
  useEventListener('mouseup', onMouseUp);
  useEventListener('mouseout', onMouseOut);

  return (
    <>
      {Object.entries(cursors).map(([id, { position, isClicking }]) => {
        const ship = ships[id];
        if (!ship) return null;
        const { patp, color } = ship;
        return (
          <div key={id}>
            <AnimatedCursor
              id={patp}
              color={(color && rgbToString(hexToRgb(color))) || undefined}
              coords={position}
              isActive={isClicking}
              isActiveClickable={isClicking}
            />
            <CursorName
              style={{
                x: position.x,
                y: position.y,
                backgroundColor: color || '0,0,0',
                color: 'white',
              }}
            >
              {patp}
            </CursorName>
          </div>
        );
      })}
    </>
  );
}

const CursorName = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 6px;
  padding: 2px 4px;
  pointer-events: none;
  font-family: 'Rubik', sans-serif;
`;
