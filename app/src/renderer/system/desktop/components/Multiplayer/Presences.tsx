// Loaded in the webview/appview preload script, connects to websocket directly
// and renders cursor based on presence
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { hexToRgb, rgbToString } from 'renderer/logic/utils/color';
import styled from 'styled-components';
import AnimatedCursor from '../Cursor';
import { useEventListener } from '../Cursor/useEventListener';
import Mouse from '../Mouse';
import { subscribe, close, send, SendPartial } from './multiplayer';
import { CursorMovePayload, CursorEvent, CursorClickPayload } from './types';

const MULTI_CLICK_ID_ATTRIB = 'data-multi-click-id';

interface CursorState extends Omit<CursorMovePayload, 'event' | 'id'> {
  isClicking?: boolean;
}

// Manage websocket connection within realm or an individual app
export const Presences = () => {
  const [cursors, setCursors] = useState<Record<string, CursorState>>({});

  useEffect(() => {
    subscribe<CursorMovePayload>(CursorEvent.Move, (payload) => {
      setCursors((prev) => {
        const { event, id, ...rest } = payload;
        return { ...prev, [payload.id]: rest };
      });
    });

    subscribe<CursorClickPayload>(CursorEvent.Click, (payload) => {
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
    });

    return () => close();
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const payload: SendPartial<CursorMovePayload> = {
      event: CursorEvent.Move,
      position: { x: e.clientX, y: e.clientY },
    };

    // FIXME: faking multiplayer with delay
    setTimeout(() => {
      send(payload);
    }, 1500);
  }, []);

  const onClick = useCallback((e: MouseEvent) => {
    // prevent multiplayer clicks from creating infinite loop
    if (!e.isTrusted) return;
    const targetId = (e.target as HTMLElement | null)?.getAttribute(
      'data-multi-click-id'
    ); // element user clicked on
    if (!targetId) return;
    const payload: SendPartial<CursorClickPayload> = {
      event: CursorEvent.Click,
      target: targetId,
    };

    // FIXME: faking multiplayer with delay
    setTimeout(() => {
      send(payload);
    }, 1500);
  }, []);

  useEventListener('mousemove', onMouseMove);
  useEventListener('click', onClick);

  return (
    <>
      {Object.entries(cursors).map(
        ([id, { color, nickname, patp, position, isClicking }]) => (
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

export { Mouse };
