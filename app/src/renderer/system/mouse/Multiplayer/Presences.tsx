import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  CursorMovePayload,
  CursorEvent,
  CursorClickPayload,
  CursorLeavePayload,
  PresenceStatePayload,
  RealmEvent,
  PresenceStateSyncPayload,
  Ship,
  CursorDownPayload,
  CursorOutPayload,
  CursorOverPayload,
  CursorUpPayload,
} from '@holium/realm-multiplayer';
import { subscribe, close, send, SendPartial } from './multiplayer';
import { hexToRgb, rgbToString } from '../../../../os/lib/color';
import { AnimatedCursor } from '../AnimatedCursor';
import { MULTI_CLICK_ID_ATTRIB } from '../Presences';

interface CursorState extends Omit<CursorMovePayload, 'event' | 'id'> {
  isClicking?: boolean;
}

// Manage websocket connection within realm or an individual app
export const Presences = () => {
  const [cursors, setCursors] = useState<Record<string, CursorState>>({});
  const [ships, setShips] = useState<Record<string, Ship>>({});

  // Update cursors for other cursors
  useEffect(() => {
    subscribe<CursorMovePayload>(CursorEvent.Move, (payload) => {
      setCursors((prev) => {
        return { ...prev, [payload.id]: payload };
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

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('blur', onMouseLeave);
    document.addEventListener('click', onClick);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('blur', onMouseLeave);
      document.removeEventListener('click', onClick);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <>
      {Object.entries(cursors).map(([id, { position, isClicking }]) => {
        const ship = ships[id];
        if (!ship) return null;
        const { patp, color } = ship;

        return (
          <div key={id}>
            <AnimatedCursor
              color={color && rgbToString(hexToRgb(color))}
              coords={position}
              isVisible={true}
              isActive={isClicking ?? false}
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
              {patp}
            </CursorName>
          </div>
        );
      })}
    </>
  );
};

const CursorName = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 6px;
  padding: 2px 4px;
  pointer-events: none;
  font-family: 'Rubik', sans-serif;
`;
